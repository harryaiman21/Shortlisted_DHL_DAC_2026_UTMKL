import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'

export default function Reports() {
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)
  const [showExportMenu, setShowExportMenu] = useState(false)
  const [exportError, setExportError] = useState('')
  const navigate = useNavigate()
  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

  async function exportReport(format) {
    setExporting(true)
    setShowExportMenu(false)
    setExportError('')
    try {
      const res = await api.get(`/export/${format}`, { responseType: 'blob' })
      const mimeTypes = {
        xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        pdf: 'application/pdf',
        docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      }
      const url = window.URL.createObjectURL(new Blob([res.data], { type: mimeTypes[format] }))
      const a = document.createElement('a')
      a.href = url
      a.download = `DHL_Incidents_Report.${format}`
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (e) {
      const status = e.response?.status
      if (status === 403) {
        setExportError('Export is restricted to admin accounts only.')
      } else {
        setExportError('Export failed. Please try again.')
      }
    }
    setExporting(false)
  }

  useEffect(() => { loadReport() }, [])

  async function loadReport() {
    try {
      const res = await api.get('/reports')
      setReport(res.data)
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  if (loading) return <div style={{ padding: 64, textAlign: 'center', color: '#999' }}>Loading reports...</div>
  if (!report) return null

  // Compute max for bar chart scaling
  const categories = Object.entries(report.by_category || {}).sort((a, b) => b[1] - a[1]).slice(0, 6)
  const maxCat = categories.length ? categories[0][1] : 1

  const barColors = ['#E74C3C', '#F39C12', '#27AE60', '#6C63FF', '#3498DB', '#9B59B6']

  const total = report.total || 1
  const highPct = Math.round(((report.by_priority?.High || 0) / total) * 100)
  const medPct = Math.round(((report.by_priority?.Medium || 0) / total) * 100)
  const lowPct = Math.round(((report.by_priority?.Low || 0) / total) * 100)

  return (
    <div style={styles.page}>
      {/* Breadcrumb */}
      <div style={styles.breadcrumb}>
        <span style={styles.breadcrumbLink} onClick={() => navigate('/')}>Dashboard</span>
        <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#bbb' }}>chevron_right</span>
        <span style={styles.breadcrumbActive}>Reports</span>
      </div>

      <header style={styles.header}>
        <div>
          <h2 style={styles.title}>Reports</h2>
          <p style={styles.subtitle}>{today}</p>
        </div>
        {/* Export Button with dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            style={styles.exportBtn}
            onClick={() => setShowExportMenu(v => !v)}
            disabled={exporting}
            onMouseEnter={e => e.currentTarget.style.background = '#B0000E'}
            onMouseLeave={e => e.currentTarget.style.background = '#D40511'}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
              {exporting ? 'sync' : 'download'}
            </span>
            {exporting ? 'Exporting...' : 'Export Report'}
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>arrow_drop_down</span>
          </button>

          {showExportMenu && (
            <div style={{
              position: 'absolute', top: '44px', right: 0, zIndex: 100,
              background: '#fff', borderRadius: '12px', padding: '8px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
              border: '1px solid #eee', minWidth: '180px'
            }}>
              {[
                { format: 'xlsx', icon: 'table_chart', label: 'Excel (.xlsx)', color: '#27AE60' },
                { format: 'pdf',  icon: 'picture_as_pdf', label: 'PDF (.pdf)', color: '#E74C3C' },
                { format: 'docx', icon: 'description', label: 'Word (.docx)', color: '#2980B9' },
              ].map(opt => (
                <button
                  key={opt.format}
                  onClick={() => exportReport(opt.format)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    width: '100%', padding: '10px 12px', borderRadius: '8px',
                    background: 'none', border: 'none', cursor: 'pointer',
                    fontSize: '13px', fontWeight: 500, color: '#333',
                    textAlign: 'left'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f5f5f5'}
                  onMouseLeave={e => e.currentTarget.style.background = 'none'}
                >
                  <span className="material-symbols-outlined" style={{ color: opt.color, fontSize: '20px' }}>
                    {opt.icon}
                  </span>
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* Export error banner */}
      {exportError && (
        <div style={{
          background: '#FFF3F3', border: '1px solid #F5C6CB', color: '#721C24',
          borderRadius: '10px', padding: '12px 16px', marginBottom: '16px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          fontSize: '13px', fontWeight: 500,
        }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#E74C3C' }}>error</span>
            {exportError}
          </span>
          <button onClick={() => setExportError('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#721C24', fontSize: '18px', lineHeight: 1 }}>×</button>
        </div>
      )}

      {/* Stats Grid */}
      <section style={styles.statsGrid}>
        {[
          { label: 'Total Incidents', value: report.total, icon: 'analytics', color: '#6C63FF' },
          { label: 'Open', value: report.by_status?.Open || 0, icon: 'warning', color: '#E74C3C' },
          { label: 'In Progress', value: report.by_status?.['In Progress'] || 0, icon: 'hourglass_top', color: '#F39C12' },
          { label: 'Resolved', value: report.by_status?.Resolved || 0, icon: 'check_circle', color: '#27AE60' },
        ].map(card => (
          <div key={card.label} style={styles.statCard}>
            <div style={styles.statTop}>
              <h3 style={styles.statLabel}>{card.label}</h3>
              <div style={{ ...styles.statIconWrap, background: card.color + '15' }}>
                <span className="material-symbols-outlined" style={{ color: card.color, fontSize: '20px' }}>{card.icon}</span>
              </div>
            </div>
            <span style={styles.statValue}>{card.value}</span>
          </div>
        ))}
      </section>

      {/* Charts Section */}
      <section style={styles.chartsGrid}>
        {/* Category Chart */}
        <div style={styles.chartCard}>
          <div style={styles.chartHeader}>
            <h3 style={styles.chartTitle}>Incidents by Category</h3>
          </div>
          <div style={styles.barChart}>
            {categories.length === 0 ? (
              <p style={{ color: '#999', textAlign: 'center' }}>No data available</p>
            ) : categories.map(([cat, count], i) => (
              <div key={cat} style={styles.barRow}>
                <div style={styles.barLabel}>{cat}</div>
                <div style={styles.barTrack}>
                  <div style={{
                    height: '100%',
                    width: `${(count / maxCat) * 100}%`,
                    background: barColors[i % barColors.length],
                    borderRadius: '4px',
                    transition: 'width 0.6s ease',
                  }} />
                </div>
                <div style={styles.barValue}>{count}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Priority Chart */}
        <div style={styles.chartCard}>
          <div style={styles.chartHeader}>
            <h3 style={styles.chartTitle}>Priority Breakdown</h3>
          </div>
          <div style={styles.priorityBars}>
            {[
              { label: 'High', pct: highPct, count: report.by_priority?.High || 0, color: '#E74C3C' },
              { label: 'Medium', pct: medPct, count: report.by_priority?.Medium || 0, color: '#F39C12' },
              { label: 'Low', pct: lowPct, count: report.by_priority?.Low || 0, color: '#27AE60' },
            ].map(p => (
              <div key={p.label} style={styles.barRow}>
                <div style={{ width: '64px', textAlign: 'right', fontSize: '12px', fontWeight: 600, color: '#888' }}>{p.label}</div>
                <div style={styles.barTrackLg}>
                  <div style={{
                    position: 'absolute', left: 0, top: 0,
                    height: '100%',
                    width: `${p.pct}%`,
                    background: p.color,
                    borderRadius: '4px',
                    transition: 'width 0.6s ease',
                  }} />
                </div>
                <div style={{ width: '40px', fontWeight: 700, fontSize: '12px', color: p.color }}>{p.pct}%</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer style={styles.footer}>
        <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>sync</span>
        Last updated: Just now
      </footer>
    </div>
  )
}

const styles = {
  page: {
    padding: '24px 32px',
    maxWidth: '1440px',
    margin: '0 auto',
  },
  breadcrumb: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    marginBottom: '16px',
  },
  breadcrumbLink: {
    fontSize: '12px',
    color: '#888',
    cursor: 'pointer',
  },
  breadcrumbActive: {
    fontSize: '12px',
    fontWeight: 600,
    color: 'var(--on-surface)',
  },
  header: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '16px',
    marginBottom: '24px',
  },
  title: {
    fontSize: '22px', fontWeight: 700,
    color: 'var(--on-surface)', margin: 0,
  },
  subtitle: { fontSize: '13px', color: '#888', marginTop: '4px' },
  exportBtn: {
    display: 'flex', alignItems: 'center', gap: '8px',
    padding: '10px 24px', background: '#D40511',
    color: '#fff', fontWeight: 600, fontSize: '13px',
    borderRadius: '10px', border: 'none', cursor: 'pointer',
    boxShadow: '0 2px 8px rgba(212,5,17,0.3)',
    transition: 'all 0.2s',
  },
  statsGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px', marginBottom: '24px',
  },
  statCard: {
    background: '#fff', borderRadius: '14px', padding: '20px',
    boxShadow: 'var(--shadow-card)', border: '1px solid var(--border-subtle)',
    display: 'flex', flexDirection: 'column', gap: '12px',
  },
  statTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
  statLabel: {
    fontSize: '12px', fontWeight: 500, textTransform: 'uppercase',
    letterSpacing: '0.05em', color: '#888', margin: 0,
  },
  statIconWrap: {
    width: '36px', height: '36px', borderRadius: '10px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  statValue: {
    fontSize: '28px', fontWeight: 700,
    color: 'var(--on-surface)',
  },
  chartsGrid: {
    display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginBottom: '24px',
  },
  chartCard: {
    background: '#fff', borderRadius: '14px', padding: '20px 24px',
    boxShadow: 'var(--shadow-card)', border: '1px solid var(--border-subtle)',
    display: 'flex', flexDirection: 'column',
  },
  chartHeader: {
    marginBottom: '20px', paddingBottom: '12px',
    borderBottom: '1px solid var(--border-subtle)',
  },
  chartTitle: { fontSize: '15px', fontWeight: 600, margin: 0, color: 'var(--on-surface)' },
  barChart: {
    display: 'flex', flexDirection: 'column', gap: '14px', flex: 1,
  },
  barRow: {
    display: 'flex', alignItems: 'center', gap: '12px',
  },
  barLabel: {
    width: '120px', textAlign: 'right', fontSize: '12px', fontWeight: 500,
    color: '#888', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
  },
  barTrack: {
    flex: 1, height: '20px', background: '#f5f5f5',
    borderRadius: '6px', overflow: 'hidden',
  },
  barValue: {
    width: '32px', fontWeight: 700, fontSize: '13px', color: 'var(--on-surface)',
  },
  priorityBars: {
    display: 'flex', flexDirection: 'column', gap: '20px', flex: 1, justifyContent: 'center',
  },
  barTrackLg: {
    flex: 1, height: '24px', background: '#f5f5f5',
    borderRadius: '6px', overflow: 'hidden', position: 'relative',
  },
  footer: {
    display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
    gap: '4px', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)',
    fontSize: '12px', color: '#999',
  },
}