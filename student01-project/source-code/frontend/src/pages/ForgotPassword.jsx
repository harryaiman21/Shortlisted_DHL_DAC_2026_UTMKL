import { useState } from 'react'
import { Link } from 'react-router-dom'

const DHL_LOGO = 'https://lh3.googleusercontent.com/aida-public/AB6AXuCnB27QrGND7sQTTpvK1rjLlrXvDjYW5qoNu8tVlxhr3Wjzsm2fs4Vao1_nmMv4g9g11s1TjTLDB41BE-VimSErQ_2O5tKdMZHrbxA_60-b4s7AzPcMjvJQk3MhSu7nebPuSL5IwLVNLv3XewZxa9vTlm9RZKRkHYe317smr4yU7MOb_l88S-5FLtN40u4NlSb7Cr-whiscdo744VqEDY9YyIeWb-Sg-HklqsAcjaOelRNP5dN5hdC-Sg2SZ0SAkQwB0lfZA1GhLAw'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => {
      setSent(true)
      setLoading(false)
    }, 1000)
  }

  return (
    <div style={styles.page}>
      <main style={styles.card}>
        {/* Brand */}
        <div style={styles.brandArea}>
          <img src={DHL_LOGO} alt="DHL Logo" style={styles.logo} />
        </div>

        {/* Header */}
        <div style={styles.header}>
          <h1 style={styles.heading}>Reset Password</h1>
          <p style={styles.subtext}>Enter your email address to receive recovery instructions.</p>
        </div>

        {sent ? (
          <div style={styles.successBox}>
            <span className="material-symbols-outlined" style={{ color: '#27AE60' }}>check_circle</span>
            <p>If an account exists with that email, a reset link has been sent. Check your inbox.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>EMAIL ADDRESS</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="e.g. employee@dhl.com"
                style={styles.input}
                required
              />
            </div>
            <button
              type="submit"
              style={styles.submitBtn}
              disabled={loading}
              onMouseEnter={e => e.currentTarget.style.background = '#B0000E'}
              onMouseLeave={e => e.currentTarget.style.background = '#D40511'}
            >
              {loading ? 'SENDING...' : 'SEND RESET LINK'}
            </button>
          </form>
        )}

        {/* Footer Nav */}
        <div style={styles.footerNav}>
          <Link to="/login" style={styles.backLink}>
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>arrow_back</span>
            <span>Return to Login</span>
          </Link>
        </div>
      </main>

      <div style={styles.footerText}>DHL APSSC • Incident Management System • 2026</div>
    </div>
  )
}

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '16px',
    background: 'linear-gradient(135deg, #f9f9f9 0%, #e8e8e8 100%)',
  },
  card: {
    width: '100%',
    maxWidth: '400px',
    background: '#fff',
    borderRadius: '16px',
    padding: '40px',
    boxShadow: '0 8px 32px rgba(0,0,0,.1)',
    display: 'flex',
    flexDirection: 'column',
  },
  brandArea: {
    marginBottom: '40px',
    display: 'flex',
    justifyContent: 'center',
  },
  logo: {
    height: '50px',
    width: 'auto',
  },
  header: {
    marginBottom: '32px',
  },
  heading: {
    fontSize: '22px',
    lineHeight: '28px',
    fontWeight: 700,
    color: 'var(--on-surface)',
    marginBottom: '8px',
  },
  subtext: {
    fontSize: '13px',
    color: '#888',
    lineHeight: '1.5',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '11px',
    fontWeight: 600,
    letterSpacing: '0.08em',
    color: '#888',
  },
  input: {
    width: '100%',
    height: '42px',
    padding: '0 14px',
    border: '1px solid var(--border-subtle)',
    borderRadius: '10px',
    fontSize: '14px',
    color: 'var(--on-surface)',
    boxSizing: 'border-box',
    background: '#fafafa',
  },
  submitBtn: {
    width: '100%',
    height: '44px',
    background: '#D40511',
    color: '#fff',
    fontWeight: 600,
    fontSize: '13px',
    letterSpacing: '0.02em',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    boxShadow: '0 4px 12px rgba(212,5,17,0.3)',
    transition: 'all 0.2s',
  },
  successBox: {
    display: 'flex',
    gap: '10px',
    alignItems: 'flex-start',
    padding: '14px',
    background: '#E8F5E9',
    borderRadius: '10px',
    fontSize: '13px',
    color: 'var(--on-surface)',
    lineHeight: '1.5',
    marginBottom: '16px',
  },
  footerNav: {
    marginTop: '40px',
    display: 'flex',
    justifyContent: 'center',
    borderTop: '1px solid var(--border-subtle)',
    paddingTop: '20px',
  },
  backLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '12px',
    color: 'var(--primary)',
    textDecoration: 'none',
    fontWeight: 500,
  },
  footerText: {
    position: 'fixed',
    bottom: '24px',
    fontSize: '11px',
    color: '#999',
    letterSpacing: '0.1em',
    opacity: 0.6,
  },
}
