import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../api'

const DHL_LOGO = 'https://lh3.googleusercontent.com/aida-public/AB6AXuCbgJ4OTQjoNjNwJeSbCw3oICD_-zPQfJeuuEvUIhCwJx5uRlbdm8Z8L7qIo_nUUDzT30DsmBWwwPp17WQ8oLHjnCBXPoAfbqTTczHgbHbd3hwqVvDAFkmD3-A6ds2Li6B2ZZFUOtUlmv-9ljhiviNAAQdzZe-qZRWBgxMkMD6AHs5Th4mUgCHCnUdfE6_XWCI2NChrG_df2GHCvRyl9dcRXyF8lngHP-y2qGLeBMGOPa3_X_9WOJjOdf_23BbUsW-gbqFTIldvnMc5rg'

export default function Login() {
  const [email, setEmail] = useState('admin@dhl.com')
  const [password, setPassword] = useState('admin123')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [hovered, setHovered] = useState(false)
  const navigate = useNavigate()

  async function handleLogin(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await api.post('/login', { email, password })
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('user', JSON.stringify(res.data.user))
      navigate('/')
    } catch {
      setError('Invalid email or password')
    }
    setLoading(false)
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        {/* Brand */}
        <div style={styles.brandArea}>
          <img src={DHL_LOGO} alt="DHL Logo" style={styles.logo} />
          <h1 style={styles.heading}>Incident Reporting System</h1>
          <p style={styles.subtext}>DHL Asia Pacific Shared Services</p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} style={styles.form}>
          {error && <div style={styles.errorBox}>{error}</div>}

          <div style={styles.fieldGroup}>
            <label style={styles.label}>EMAIL ADDRESS</label>
            <div style={styles.inputWrapper}>
              <span className="material-symbols-outlined" style={styles.inputIcon}>mail</span>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                style={styles.input}
                required
              />
            </div>
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>PASSWORD</label>
            <div style={styles.inputWrapper}>
              <span className="material-symbols-outlined" style={styles.inputIcon}>lock</span>
              <input
                id="login-password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                style={styles.input}
                required
              />
            </div>
          </div>

          <div style={styles.row}>
            <label style={styles.checkboxLabel}>
              <input type="checkbox" style={styles.checkbox} />
              <span style={{ color: '#888', fontSize: '13px' }}>Remember me</span>
            </label>
            <Link to="/forgot-password" style={styles.forgotLink}>Forgot Password?</Link>
          </div>

          <button
            type="submit"
            style={{
              ...styles.submitBtn,
              background: hovered ? '#B0000E' : '#D40511',
            }}
            disabled={loading}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
          >
            {loading ? 'Signing in...' : 'Sign In'}
            {!loading && <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_forward</span>}
          </button>
        </form>
      </div>

      <div style={styles.footer}>DHL APSSC © 2026</div>
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
    background: 'linear-gradient(135deg, #f9f9f9 0%, #e8e8e8 100%)',
    padding: '16px',
  },
  card: {
    width: '100%',
    maxWidth: '400px',
    background: '#fff',
    borderRadius: '16px',
    boxShadow: '0 8px 32px rgba(0,0,0,.1)',
    padding: '40px',
    display: 'flex',
    flexDirection: 'column',
  },
  brandArea: {
    marginBottom: '32px',
  },
  logo: {
    width: '120px',
    height: 'auto',
    marginBottom: '24px',
  },
  heading: {
    fontSize: '22px',
    lineHeight: '28px',
    fontWeight: 700,
    color: 'var(--on-surface)',
    margin: 0,
  },
  subtext: {
    fontSize: '13px',
    color: '#888',
    marginTop: '8px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  errorBox: {
    background: '#FEF2F2',
    color: '#E74C3C',
    padding: '10px 14px',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: 500,
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
  inputWrapper: {
    position: 'relative',
  },
  inputIcon: {
    position: 'absolute',
    left: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#bbb',
    fontSize: '18px',
  },
  input: {
    width: '100%',
    height: '42px',
    padding: '0 14px 0 40px',
    border: '1px solid var(--border-subtle)',
    borderRadius: '10px',
    fontSize: '14px',
    color: 'var(--on-surface)',
    background: '#fafafa',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s',
  },
  row: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '-4px',
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    cursor: 'pointer',
  },
  checkbox: {
    width: '14px',
    height: '14px',
    accentColor: '#D40511',
  },
  forgotLink: {
    fontSize: '12px',
    color: '#D40511',
    textDecoration: 'none',
    fontWeight: 500,
  },
  submitBtn: {
    width: '100%',
    height: '44px',
    background: '#D40511',
    color: '#fff',
    fontSize: '14px',
    fontWeight: 600,
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    boxShadow: '0 4px 12px rgba(212,5,17,0.3)',
    transition: 'all 0.2s',
    marginTop: '4px',
  },
  footer: {
    marginTop: '32px',
    fontSize: '11px',
    fontWeight: 500,
    color: '#999',
    letterSpacing: '0.1em',
  },
}