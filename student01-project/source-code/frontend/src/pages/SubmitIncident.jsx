import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'

export default function SubmitIncident() {
  const [rawContent, setRawContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [fileName, setFileName] = useState('')
  const fileRef = useRef()
  const navigate = useNavigate()

  async function handleFileUpload(e) {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    setError('')
    setFileName(file.name)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await api.post('/upload-file', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setRawContent(res.data.text)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to read file. Try copy-pasting the content instead.')
    }
    setUploading(false)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!rawContent.trim()) return setError('Please paste an incident report or upload a file.')
    setLoading(true)
    setError('')
    try {
      const res = await api.post('/incidents', { raw_content: rawContent })
      navigate(`/incidents/${res.data.id}`)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit')
    }
    setLoading(false)
  }

  return (
    <div style={styles.page} className="submit-page">
      {/* Breadcrumb */}
      <div style={styles.breadcrumb}>
        <span style={styles.breadcrumbLink} onClick={() => navigate('/')}>Dashboard</span>
        <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#bbb' }}>chevron_right</span>
        <span style={styles.breadcrumbActive}>New Incident</span>
      </div>

      {/* Header */}
      <header style={styles.header}>
        <div>
          <h2 style={styles.title}>New Incident</h2>
          <p style={styles.subtitle}>Submit a raw incident report for AI-powered classification</p>
        </div>
        <button
          style={styles.backBtn}
          onClick={() => navigate('/')}
          onMouseEnter={e => e.currentTarget.style.background = '#f5f5f5'}
          onMouseLeave={e => e.currentTarget.style.background = '#fff'}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_back</span>
          Back to Dashboard
        </button>
      </header>

      {/* Content */}
      <div style={styles.grid} className="submit-grid">
        {/* Form Card */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <span className="material-symbols-outlined" style={{ color: 'var(--primary)', fontSize: '20px' }}>edit_note</span>
            <h3 style={styles.cardTitle}>Raw Incident Report</h3>
          </div>

          <form onSubmit={handleSubmit} style={styles.form}>
            {error && (
              <div style={styles.errorBox}>
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>error</span>
                {error}
              </div>
            )}

            {/* File Upload */}
            <div style={{ marginBottom: '16px' }}>
              <label style={styles.label}>UPLOAD FILE (PDF, DOCX, TXT)</label>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                <input
                  ref={fileRef}
                  type="file"
                  accept=".pdf,.docx,.txt"
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                  id="file-upload"
                />
                <label htmlFor="file-upload" style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '10px 18px', borderRadius: '8px', cursor: 'pointer',
                  background: '#1a1a2e', color: '#fff', fontSize: '13px', fontWeight: 600,
                  border: 'none', userSelect: 'none'
                }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>upload_file</span>
                  {uploading ? 'Reading file...' : 'Choose File'}
                </label>
                {fileName && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#E8F5E9', padding: '6px 12px', borderRadius: '8px', border: '1px solid #27AE60' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#27AE60' }}>check_circle</span>
                    <span style={{ fontSize: '13px', color: '#1a1a1a', fontWeight: 500 }}>{fileName}</span>
                    <span
                      className="material-symbols-outlined"
                      onClick={() => { setFileName(''); setRawContent(''); fileRef.current.value = '' }}
                      style={{ fontSize: '16px', color: '#E74C3C', cursor: 'pointer', marginLeft: '4px' }}
                      title="Remove file"
                    >cancel</span>
                  </span>
                )}
              </div>
              <p style={{ margin: '6px 0 0', fontSize: '11px', color: '#999' }}>
                File content will be extracted and placed in the text area below
              </p>
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>INCIDENT DESCRIPTION</label>
              <textarea
                value={rawContent}
                onChange={e => setRawContent(e.target.value)}
                placeholder={"Paste the raw incident report here...\n\nExample: Customer called on 14 May 2026 at 10:30 AM regarding a missing parcel. Tracking number: 123456789. The package was shipped from Kuala Lumpur to Shah Alam on 10 May. Customer is requesting a full refund..."}
                style={styles.textarea}
                rows={12}
              />
              <div style={styles.charCount}>{rawContent.length} characters</div>
            </div>

            <button type="submit" style={styles.submitBtn} disabled={loading}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#B0000E' }}
              onMouseLeave={e => { if (!loading) e.currentTarget.style.background = '#D40511' }}
            >
              {loading ? (
                <>
                  <span className="material-symbols-outlined" style={{ fontSize: '18px', animation: 'spin 1s linear infinite' }}>progress_activity</span>
                  Analyzing with AI...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>auto_awesome</span>
                  SUBMIT & CLASSIFY WITH AI
                </>
              )}
            </button>
          </form>
        </div>

        {/* Tips Card */}
        <div style={styles.tipCard}>
          <div style={styles.cardHeader}>
            <span className="material-symbols-outlined" style={{ color: '#F39C12', fontSize: '20px' }}>tips_and_updates</span>
            <h3 style={styles.cardTitle}>Tips for Best Results</h3>
          </div>
          <ul style={styles.tipList}>
            {[
              'Include specific dates, times, and locations',
              'Add tracking numbers or order references',
              'Describe the customer\'s issue clearly',
              'Mention any previous interactions',
              'Note the urgency level if applicable',
            ].map((tip, i) => (
              <li key={i} style={styles.tipItem}>
                <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#27AE60' }}>check_circle</span>
                {tip}
              </li>
            ))}
          </ul>

          <div style={styles.aiNote}>
            <span className="material-symbols-outlined" style={{ fontSize: '20px', color: 'var(--primary)' }}>smart_toy</span>
            <p style={{ margin: 0, fontSize: '12px', color: '#888' }}>
              AI will automatically extract: <strong>title, summary, category, priority,</strong> and <strong>duplicate detection.</strong>
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @media (max-width: 768px) {
          .submit-grid { grid-template-columns: 1fr !important; }
          .submit-page { padding: 16px !important; }
        }
      `}</style>
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
  breadcrumbLink: { fontSize: '12px', color: '#888', cursor: 'pointer' },
  breadcrumbActive: { fontSize: '12px', fontWeight: 600, color: 'var(--on-surface)' },
  header: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '16px',
    marginBottom: '24px',
  },
  title: {
    fontSize: '22px',
    fontWeight: 700,
    color: 'var(--on-surface)',
    margin: 0,
  },
  subtitle: {
    fontSize: '13px',
    color: '#888',
    marginTop: '4px',
  },
  backBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 20px',
    background: '#fff',
    color: 'var(--on-surface)',
    fontWeight: 600,
    fontSize: '13px',
    borderRadius: '10px',
    border: '1px solid var(--border-subtle)',
    cursor: 'pointer',
    boxShadow: 'var(--shadow-card)',
    transition: 'all 0.15s',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 340px',
    gap: '20px',
    alignItems: 'start',
  },
  card: {
    background: '#fff',
    borderRadius: '14px',
    boxShadow: 'var(--shadow-card)',
    border: '1px solid var(--border-subtle)',
    padding: '24px',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '20px',
    paddingBottom: '12px',
    borderBottom: '1px solid var(--border-subtle)',
  },
  cardTitle: {
    fontSize: '14px',
    fontWeight: 600,
    margin: 0,
    color: 'var(--on-surface)',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  errorBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 14px',
    background: '#FEF2F2',
    color: '#E74C3C',
    borderRadius: '10px',
    fontSize: '13px',
    fontWeight: 500,
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    fontSize: '11px',
    fontWeight: 600,
    letterSpacing: '0.08em',
    color: '#888',
  },
  textarea: {
    width: '100%',
    padding: '14px',
    border: '1px solid var(--border-subtle)',
    borderRadius: '10px',
    fontSize: '14px',
    lineHeight: '1.6',
    color: '#444',
    resize: 'vertical',
    minHeight: '240px',
    boxSizing: 'border-box',
    background: '#fafafa',
  },
  charCount: {
    textAlign: 'right',
    fontSize: '11px',
    color: '#bbb',
  },
  submitBtn: {
    width: '100%',
    padding: '12px',
    background: '#D40511',
    color: '#fff',
    fontSize: '13px',
    fontWeight: 600,
    letterSpacing: '0.02em',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    boxShadow: '0 2px 8px rgba(212,5,17,0.3)',
    transition: 'all 0.2s',
  },
  tipCard: {
    background: '#fff',
    borderRadius: '14px',
    boxShadow: 'var(--shadow-card)',
    border: '1px solid var(--border-subtle)',
    padding: '24px',
  },
  tipList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    marginBottom: '20px',
  },
  tipItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '13px',
    color: '#555',
  },
  aiNote: {
    display: 'flex',
    gap: '10px',
    alignItems: 'flex-start',
    padding: '14px',
    background: '#fafafa',
    borderRadius: '10px',
    border: '1px solid var(--border-subtle)',
  },
}