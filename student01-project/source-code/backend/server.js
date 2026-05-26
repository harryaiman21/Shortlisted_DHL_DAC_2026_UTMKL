require('dotenv').config()
const express = require('express')
const cors = require('cors')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { initDB, getNextId, getPool } = require('./db')
const { analyzeIncident, isDHLRelated, extractCustomerName, extractTags } = require('./ai')
const XLSX = require('xlsx')
const PDFDocument = require('pdfkit')
const { Document, Packer, Paragraph, Table, TableRow, TableCell, TextRun, HeadingLevel, WidthType } = require('docx')


const app = express()
app.use(cors())
app.use(express.json())

// ──────────────────────────────────────────────
// AUTH MIDDLEWARE
// ──────────────────────────────────────────────
function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) return res.status(401).json({ error: 'No token' })
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET)
    next()
  } catch {
    res.status(401).json({ error: 'Invalid token' })
  }
}


// ──────────────────────────────────────────────
// AUTH ROUTES
// ──────────────────────────────────────────────

// Login
app.post('/api/login', async (req, res) => {
  try {
    const pool = getPool()
    const { email, password } = req.body
    const [rows] = await pool.execute('SELECT * FROM users WHERE email = ?', [email])
    const user = rows[0]
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    )

    res.json({ token, user: { id: user.id, email: user.email, role: user.role } })
  } catch (e) {
    console.error('Login error:', e.message)
    res.status(500).json({ error: 'Server error' })
  }
})

// ──────────────────────────────────────────────
// INCIDENT ROUTES
// ──────────────────────────────────────────────

// Get all incidents
app.get('/api/incidents', authMiddleware, async (req, res) => {
  try {
    const pool = getPool()
    let sql = 'SELECT * FROM incidents WHERE 1=1'
    const params = []

    if (req.query.status) {
      sql += ' AND status = ?'
      params.push(req.query.status)
    }
    if (req.query.category) {
      sql += ' AND category = ?'
      params.push(req.query.category)
    }
    if (req.query.priority) {
      sql += ' AND priority = ?'
      params.push(req.query.priority)
    }
    if (req.query.tag) {
      sql += ' AND tags LIKE ?'
      params.push(`%${req.query.tag}%`)
    }
    if (req.query.creator) {
      sql += ' AND created_by LIKE ?'
      params.push(`%${req.query.creator.trim()}%`)
    }
    if (req.query.search) {
      const searchTerm = req.query.search.trim()
      let cleanIdTerm = searchTerm
      if (searchTerm.toUpperCase().startsWith('INC-')) {
        cleanIdTerm = searchTerm.substring(4)
      }
      const s = `%${searchTerm}%`
      const sId = `%${cleanIdTerm}%`
      sql += ` AND (
        CAST(id AS CHAR) LIKE ? OR customer_name LIKE ? OR title LIKE ? OR
        category LIKE ? OR priority LIKE ? OR status LIKE ? OR
        source LIKE ? OR created_by LIKE ? OR summary LIKE ? OR raw_content LIKE ?
      )`
      params.push(sId, s, s, s, s, s, s, s, s, s)
    }

    sql += ' ORDER BY created_at DESC'
    const [incidents] = await pool.execute(sql, params)
    res.json(incidents.map(normalizeIncident))
  } catch (e) {
    console.error('Get incidents error:', e.message)
    res.status(500).json({ error: 'Server error' })
  }
})

// Get single incident
app.get('/api/incidents/:id', authMiddleware, async (req, res) => {
  try {
    const pool = getPool()
    const [rows] = await pool.execute('SELECT * FROM incidents WHERE id = ?', [req.params.id])
    if (rows.length === 0) return res.status(404).json({ error: 'Not found' })
    res.json(normalizeIncident(rows[0]))
  } catch (e) {
    console.error('Get incident error:', e.message)
    res.status(500).json({ error: 'Server error' })
  }
})

// Create incident (with AI analysis)
app.post('/api/incidents', authMiddleware, async (req, res) => {
  try {
    const pool = getPool()
    const { raw_content } = req.body
    if (!raw_content) return res.status(400).json({ error: 'raw_content required' })

    // 1. Extract sender — flexible regex handles "From: name <email>", "From: email", "FROM   email"
    const emailMatch = raw_content.match(/from[\s:]+.*?<([^>]+)>/i)
      || raw_content.match(/from[\s:]+([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i)
      || raw_content.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i)

    // Use found email, or fall back to logged-in user's email
    const senderEmail = (emailMatch ? emailMatch[1].toLowerCase().trim() : '') || req.user?.email || ''

    // 2. Also run the marketing footprint and DHL-relevance check
    if (!isDHLRelated(raw_content)) {
       console.log(`[API] Rejected non-DHL content`)
       return res.status(400).json({ error: 'Content does not appear to be related to DHL logistics.' })
    }

    const [existing] = await pool.execute('SELECT * FROM incidents')

    let aiResult = {}
    try {
      aiResult = await analyzeIncident(raw_content, existing)
    } catch (e) {
      console.error('AI error:', e.message)
      aiResult = {
        title: 'Incident Report',
        summary: raw_content.substring(0, 200),
        category: 'Customer Complaint',
        priority: 'Medium',
        is_duplicate: false,
        duplicate_reason: ''
      }
    }

    const incidentId = await getNextId()
    const now = new Date()

    const tags = extractTags(raw_content, aiResult.category)
    await pool.execute(
      `INSERT INTO incidents
        (id, raw_content, customer_name, title, summary, category, priority,
         is_duplicate, duplicate_reason, status, tags, source, created_by, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        incidentId, raw_content, extractCustomerName(raw_content),
        aiResult.title || 'Incident Report',
        aiResult.summary || raw_content.substring(0, 200),
        aiResult.category || 'Customer Complaint',
        aiResult.priority || 'Medium',
        aiResult.is_duplicate ? 1 : 0,
        aiResult.duplicate_reason || '',
        'Draft', tags, 'Manual', req.user.email, now, now
      ]
    )

    const [rows] = await pool.execute('SELECT * FROM incidents WHERE id = ?', [incidentId])
    res.status(201).json(normalizeIncident(rows[0]))
  } catch (e) {
    console.error('Create incident error:', e.message)
    res.status(500).json({ error: 'Server error' })
  }
})

// Delete incident (admin only)
app.delete('/api/incidents/:id', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can delete incidents' })
    }
    const pool = getPool()
    const [result] = await pool.execute('DELETE FROM incidents WHERE id = ?', [req.params.id])
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Not found' })
    res.json({ success: true, message: 'Incident deleted' })
  } catch (e) {
    console.error('Delete error:', e.message)
    res.status(500).json({ error: 'Server error' })
  }
})

const VALID_STATUSES = ['Draft', 'Reviewed', 'Published', 'Open', 'In Progress', 'Resolved']

// Update incident status + log history
app.patch('/api/incidents/:id/status', authMiddleware, async (req, res) => {
  try {
    if (!VALID_STATUSES.includes(req.body.status)) {
      return res.status(400).json({ error: 'Invalid status.' })
    }
    const pool = getPool()
    const [current] = await pool.execute('SELECT status FROM incidents WHERE id = ?', [req.params.id])
    if (current.length === 0) return res.status(404).json({ error: 'Not found' })
    const oldStatus = current[0].status
    await pool.execute('UPDATE incidents SET status = ?, updated_at = ? WHERE id = ?', [req.body.status, new Date(), req.params.id])
    await pool.execute(
      'INSERT INTO incident_history (incident_id, old_status, new_status, changed_by, note) VALUES (?, ?, ?, ?, ?)',
      [req.params.id, oldStatus, req.body.status, req.user?.email || 'system', req.body.note || '']
    )
    const [rows] = await pool.execute('SELECT * FROM incidents WHERE id = ?', [req.params.id])
    res.json(normalizeIncident(rows[0]))
  } catch (e) {
    console.error('Update status error:', e.message)
    res.status(500).json({ error: 'Server error' })
  }
})

// Get incident version history
app.get('/api/incidents/:id/history', authMiddleware, async (req, res) => {
  try {
    const pool = getPool()
    const [rows] = await pool.execute(
      'SELECT * FROM incident_history WHERE incident_id = ? ORDER BY changed_at ASC',
      [req.params.id]
    )
    res.json(rows)
  } catch (e) {
    res.status(500).json({ error: 'Server error' })
  }
})

// ──────────────────────────────────────────────
// REPORTS
// ──────────────────────────────────────────────
app.get('/api/reports', authMiddleware, async (req, res) => {
  try {
    const pool = getPool()
    const [incidents] = await pool.execute('SELECT * FROM incidents')
    const report = {
      total: incidents.length,
      by_status: {
        Open: incidents.filter(i => i.status === 'Open').length,
        'In Progress': incidents.filter(i => i.status === 'In Progress').length,
        Resolved: incidents.filter(i => i.status === 'Resolved').length
      },
      by_category: {},
      by_priority: { High: 0, Medium: 0, Low: 0 }
    }
    incidents.forEach(i => {
      if (i.category) report.by_category[i.category] = (report.by_category[i.category] || 0) + 1
      if (i.priority) report.by_priority[i.priority] = (report.by_priority[i.priority] || 0) + 1
    })
    res.json(report)
  } catch (e) {
    console.error('Reports error:', e.message)
    res.status(500).json({ error: 'Server error' })
  }
})

// ──────────────────────────────────────────────
// ──────────────────────────────────────────────
// FILE UPLOAD — PDF / DOCX / TXT
// ──────────────────────────────────────────────
const multer = require('multer')
const mammoth = require('mammoth')
const PDFParser = require('pdf2json')
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } })

function parsePDF(buffer) {
  return new Promise((resolve, reject) => {
    const parser = new PDFParser(null, 1)
    parser.on('pdfParser_dataReady', (pdfData) => {
      try {
        let text = ''
        if (pdfData && pdfData.Pages) {
          for (const page of pdfData.Pages) {
            // Sort by Y then X so reading order is preserved
            const items = (page.Texts || []).slice().sort((a, b) => a.y - b.y || a.x - b.x)
            let lastY = null
            for (const textItem of items) {
              const content = decodeURIComponent(textItem.R.map(r => r.T).join(''))
              // Insert a newline whenever Y position changes — preserves line structure
              if (lastY !== null && Math.abs(textItem.y - lastY) > 0.3) {
                text += '\n'
              }
              text += content + ' '
              lastY = textItem.y
            }
            text += '\n'
          }
        }
        resolve(text.trim() || parser.getRawTextContent())
      } catch (e) {
        reject(e)
      }
    })
    parser.on('pdfParser_dataError', errData => {
      reject(new Error(errData?.parserError || 'PDF parse failed'))
    })
    parser.parseBuffer(buffer)
  })
}

app.post('/api/upload-file', authMiddleware, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' })
    const { mimetype, buffer, originalname } = req.file
    let text = ''

    if (mimetype === 'application/pdf' || originalname.endsWith('.pdf')) {
      text = await parsePDF(buffer)
    } else if (
      mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      originalname.endsWith('.docx')
    ) {
      const result = await mammoth.extractRawText({ buffer })
      text = result.value
    } else {
      text = buffer.toString('utf8')
    }

    if (!text.trim()) return res.status(400).json({ error: 'No text found in file. The file may be image-based or empty.' })
    res.json({ text: text.trim(), filename: originalname })
  } catch (e) {
    console.error('File upload error:', e.message)
    res.status(500).json({ error: `Failed to read file: ${e.message}` })
  }
})

// UiPath INGEST (no auth)
// ──────────────────────────────────────────────
app.post('/api/ingest', async (req, res) => {
  try {
    const pool = getPool()
    const { raw_content, source } = req.body
    console.log(`[INGEST] Received from: ${source || 'unknown'} | Content length: ${raw_content?.length || 0} chars`)
    if (!raw_content) return res.status(400).json({ error: 'raw_content required' })

    const [existing] = await pool.execute('SELECT * FROM incidents')

    let aiResult = {}
    try {
      aiResult = await analyzeIncident(raw_content, existing)
    } catch (e) {
      aiResult = {
        title: 'Auto Ingested Incident',
        summary: raw_content.substring(0, 200),
        category: 'Customer Complaint',
        priority: 'Medium',
        is_duplicate: false,
        duplicate_reason: ''
      }
    }

    if (aiResult.is_duplicate) {
      console.log(`[INGEST] Ignored duplicate: ${aiResult.duplicate_reason}`)
      return res.status(200).json({ 
        message: 'Duplicate ignored', 
        reason: aiResult.duplicate_reason,
        is_duplicate: true 
      })
    }

    const incidentId = await getNextId()
    const now = new Date()

    const ingestTags = extractTags(raw_content, aiResult.category)
    await pool.execute(
      `INSERT INTO incidents
        (id, raw_content, customer_name, title, summary, category, priority,
         is_duplicate, duplicate_reason, status, tags, source, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        incidentId, raw_content, extractCustomerName(raw_content),
        aiResult.title || 'Auto Ingested Incident',
        aiResult.summary || raw_content.substring(0, 200),
        aiResult.category || 'Customer Complaint',
        aiResult.priority || 'Medium',
        0,
        '',
        'Draft', ingestTags, source || 'UiPath Bot', now, now
      ]
    )

    const [rows] = await pool.execute('SELECT * FROM incidents WHERE id = ?', [incidentId])
    console.log(`[INGEST] ✅ Saved to MySQL — ID: ${incidentId} | Title: ${aiResult.title}`)
    res.status(201).json(normalizeIncident(rows[0]))
  } catch (e) {
    console.error('Ingest error:', e.message)
    res.status(500).json({ error: 'Server error' })
  }
})


// ──────────────────────────────────────────────
// RPA EXPORT (no auth)
// ──────────────────────────────────────────────
app.get('/api/export', async (req, res) => {
  try {
    const pool = getPool()
    const [incidents] = await pool.execute('SELECT * FROM incidents ORDER BY created_at DESC')
    res.json(incidents.map(normalizeIncident))
  } catch (e) {
    res.status(500).json({ error: 'Export error' })
  }
})

// ──────────────────────────────────────────────
// EXPORT INCIDENTS (xlsx / pdf / docx)
// ──────────────────────────────────────────────
app.get('/api/export/:format', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin only' })
    const pool = getPool()
    const [incidents] = await pool.execute('SELECT * FROM incidents ORDER BY created_at DESC')
    const format = req.params.format.toLowerCase()

    const rows = incidents.map(i => ({
      ID: String(i.id),
      'Customer Name': i.customer_name || 'Unknown',
      Title: i.title || '',
      Category: i.category || '',
      Priority: i.priority || '',
      Status: i.status || '',
      Source: i.source || '',
      'Created By': i.created_by || '',
      'Created At': new Date(i.created_at).toLocaleString(),
      'Updated At': new Date(i.updated_at).toLocaleString(),
      'Raw Content': (i.raw_content || '').substring(0, 300)
    }))

    if (format === 'xlsx') {
      const wb = XLSX.utils.book_new()
      const ws = XLSX.utils.json_to_sheet(rows)
      ws['!cols'] = [
        { wch: 10 }, { wch: 40 }, { wch: 20 }, { wch: 12 },
        { wch: 14 }, { wch: 14 }, { wch: 20 }, { wch: 20 },
        { wch: 20 }, { wch: 50 }
      ]
      XLSX.utils.book_append_sheet(wb, ws, 'Incidents')
      const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })
      res.setHeader('Content-Disposition', 'attachment; filename=DHL_Incidents_Report.xlsx')
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
      return res.send(buf)
    }

    if (format === 'pdf') {
      const doc = new PDFDocument({ margin: 40, size: 'A4', layout: 'landscape' })
      res.setHeader('Content-Disposition', 'attachment; filename=DHL_Incidents_Report.pdf')
      res.setHeader('Content-Type', 'application/pdf')
      doc.pipe(res)

      doc.fontSize(18).font('Helvetica-Bold').text('DHL Incident Management Report', { align: 'center' })
      doc.fontSize(10).font('Helvetica').text(`Generated: ${new Date().toLocaleString()} | Total: ${incidents.length} incidents`, { align: 'center' })
      doc.moveDown()

      const cols = ['ID', 'Title', 'Category', 'Priority', 'Status', 'Created At']
      const colW = [60, 200, 100, 65, 80, 110]
      let y = doc.y

      doc.font('Helvetica-Bold').fontSize(8)
      let x = 40
      cols.forEach((col, i) => {
        doc.rect(x, y, colW[i], 18).fillAndStroke('#D40511', '#D40511')
        doc.fillColor('white').text(col, x + 3, y + 5, { width: colW[i] - 6, lineBreak: false })
        x += colW[i]
      })
      y += 18

      doc.font('Helvetica').fontSize(7)
      incidents.forEach((inc, idx) => {
        if (y > 530) { doc.addPage({ layout: 'landscape' }); y = 40 }
        const bg = idx % 2 === 0 ? '#FFFFFF' : '#F9F9F9'
        x = 40
        const vals = [String(inc.id), inc.title || '', inc.category || '', inc.priority || '', inc.status || '', new Date(inc.created_at).toLocaleDateString()]
        vals.forEach((val, i) => {
          doc.rect(x, y, colW[i], 16).fillAndStroke(bg, '#DDDDDD')
          doc.fillColor('#333333').text(val.substring(0, 30), x + 3, y + 4, { width: colW[i] - 6, lineBreak: false })
          x += colW[i]
        })
        y += 16
      })

      doc.end()
      return
    }

    if (format === 'docx') {
      const headerCells = ['ID', 'Title', 'Category', 'Priority', 'Status', 'Source', 'Created At'].map(h =>
        new TableCell({
          children: [new Paragraph({ children: [new TextRun({ text: h, bold: true, color: 'FFFFFF', size: 18 })], spacing: { before: 60, after: 60 } })],
          shading: { fill: 'D40511' },
          margins: { top: 60, bottom: 60, left: 80, right: 80 }
        })
      )

      const dataRows = incidents.map((inc, idx) =>
        new TableRow({
          children: [
            String(inc.id), inc.title || '', inc.category || '',
            inc.priority || '', inc.status || '', inc.source || '',
            new Date(inc.created_at).toLocaleDateString()
          ].map(val =>
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: val.substring(0, 50), size: 16 })], spacing: { before: 40, after: 40 } })],
              shading: { fill: idx % 2 === 0 ? 'FFFFFF' : 'FFF5F5' },
              margins: { top: 40, bottom: 40, left: 80, right: 80 }
            })
          )
        })
      )

      const docFile = new Document({
        sections: [{
          children: [
            new Paragraph({ text: 'DHL Incident Management Report', heading: HeadingLevel.HEADING_1, spacing: { after: 200 } }),
            new Paragraph({ children: [new TextRun({ text: `Generated: ${new Date().toLocaleString()} | Total: ${incidents.length} incidents`, size: 18, color: '666666' })], spacing: { after: 400 } }),
            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              rows: [new TableRow({ children: headerCells, tableHeader: true }), ...dataRows]
            })
          ]
        }]
      })

      const buf = await Packer.toBuffer(docFile)
      res.setHeader('Content-Disposition', 'attachment; filename=DHL_Incidents_Report.docx')
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')
      return res.send(buf)
    }

    res.status(400).json({ error: 'Format must be xlsx, pdf, or docx' })
  } catch (e) {
    console.error('Export error:', e.message)
    res.status(500).json({ error: e.message })
  }
})

// ──────────────────────────────────────────────
// HELPERS
// ──────────────────────────────────────────────
function normalizeIncident(row) {
  return {
    ...row,
    is_duplicate: Boolean(row.is_duplicate),
    tags: row.tags ? row.tags.split(',').filter(Boolean) : [],
    created_at: row.created_at instanceof Date ? row.created_at.toISOString() : row.created_at,
    updated_at: row.updated_at instanceof Date ? row.updated_at.toISOString() : row.updated_at
  }
}

// ──────────────────────────────────────────────
// START SERVER
// ──────────────────────────────────────────────
const PORT = process.env.PORT || 3000
initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`)
    console.log('Ready — waiting for UiPath to POST incidents to /api/ingest')
  })
}).catch(e => {
  console.error('Failed to connect to MySQL:', e.message)
  console.error('Check DB_HOST, DB_USER, DB_PASSWORD, DB_NAME in your .env file')
  process.exit(1)
})
