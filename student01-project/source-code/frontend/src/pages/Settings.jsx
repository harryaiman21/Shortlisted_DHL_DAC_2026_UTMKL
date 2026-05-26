import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Settings() {
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const [notifications, setNotifications] = useState({
    email_notifications: true,
    new_incidents: true,
    status_changes: false
  })
  const navigate = useNavigate()

  // User details retrieved from local storage for demo purposes
  const userString = localStorage.getItem('user')
  const user = userString ? JSON.parse(userString) : { email: 'admin@dhl.com', role: 'admin' }
  const defaultName = user.email.split('@')[0]

  function handleSave() {
    setSaving(true)
    setMsg('')
    setTimeout(() => {
      setMsg('Settings saved successfully.')
      setSaving(false)
      setTimeout(() => setMsg(''), 3000)
    }, 500)
  }

  return (
    <div style={styles.page}>
      <div style={styles.breadcrumb}>
        <span style={styles.breadcrumbLink} onClick={() => navigate('/')}>Dashboard</span>
        <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#bbb' }}>chevron_right</span>
        <span style={styles.breadcrumbActive}>Settings</span>
      </div>

      <div style={styles.titleRow}>
        <h2 style={styles.title}>Settings</h2>
        <p style={styles.subtitle}>Manage your profile and system preferences</p>
      </div>

      {msg && (
        <div style={{
          padding: '12px 14px', borderRadius: '10px', marginBottom: '16px',
          background: '#E8F5E9', color: '#27AE60',
          fontSize: '13px', fontWeight: 500,
        }}>
          {msg}
        </div>
      )}

      <div style={styles.sections}>
        {/* User Profile */}
        <section style={styles.card}>
          <div style={styles.cardHeader}>
            <span className="material-symbols-outlined" style={{ color: 'var(--primary)', fontSize: '20px' }}>person</span>
            <h3 style={styles.cardTitle}>My Profile</h3>
          </div>
          <div style={styles.formGrid}>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>FULL NAME</label>
              <input type="text" value={defaultName} readOnly style={{ ...styles.input, background: '#fafafa', color: '#888', cursor: 'not-allowed' }} />
            </div>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>EMAIL ADDRESS</label>
              <input type="email" value={user.email} readOnly style={{ ...styles.input, background: '#fafafa', color: '#888', cursor: 'not-allowed' }} />
            </div>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>ROLE</label>
              <div>
                <span style={styles.roleBadge}>{user.role.toUpperCase()}</span>
              </div>
            </div>
          </div>
          <div style={{ marginTop: '20px' }}>
            <button style={styles.secondaryBtn}>EDIT PROFILE</button>
          </div>
        </section>

        {/* Notification Settings */}
        <section style={styles.card}>
          <div style={styles.cardHeader}>
            <span className="material-symbols-outlined" style={{ color: 'var(--primary)', fontSize: '20px' }}>notifications_active</span>
            <h3 style={styles.cardTitle}>Notification Settings</h3>
          </div>
          <div style={styles.toggleList}>
            <div style={styles.toggleRow}>
              <div>
                <p style={styles.toggleLabel}>Email notifications</p>
                <p style={styles.toggleDesc}>Receive general email notifications</p>
              </div>
              <input
                type="checkbox"
                checked={notifications.email_notifications}
                onChange={e => setNotifications({ ...notifications, email_notifications: e.target.checked })}
                style={styles.checkbox}
              />
            </div>
            <div style={styles.toggleRow}>
              <div>
                <p style={styles.toggleLabel}>New incident alerts</p>
                <p style={styles.toggleDesc}>Receive an alert every time a new incident is logged</p>
              </div>
              <input
                type="checkbox"
                checked={notifications.new_incidents}
                onChange={e => setNotifications({ ...notifications, new_incidents: e.target.checked })}
                style={styles.checkbox}
              />
            </div>
            <div style={styles.toggleRow}>
              <div>
                <p style={styles.toggleLabel}>Status change alerts</p>
                <p style={styles.toggleDesc}>Get notified when an incident moves from 'Open' to 'Resolved'</p>
              </div>
              <input
                type="checkbox"
                checked={notifications.status_changes}
                onChange={e => setNotifications({ ...notifications, status_changes: e.target.checked })}
                style={styles.checkbox}
              />
            </div>
          </div>
          <div style={{ marginTop: '20px' }}>
            <button
              onClick={handleSave}
              disabled={saving}
              style={styles.saveBtn}
              onMouseEnter={e => e.currentTarget.style.background = '#B0000E'}
              onMouseLeave={e => e.currentTarget.style.background = '#D40511'}
            >
              {saving ? 'SAVING...' : 'SAVE SETTINGS'}
            </button>
          </div>
        </section>

        {/* Customer Support */}
        <section style={styles.card}>
          <div style={styles.cardHeader}>
            <span className="material-symbols-outlined" style={{ color: 'var(--primary)', fontSize: '20px' }}>help</span>
            <h3 style={styles.cardTitle}>Customer Support</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <p style={{ margin: 0, fontWeight: 600, fontSize: '13px', color: 'var(--on-surface)' }}>Support Contact Info</p>
              <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#888' }}>Email: support@dhl.com<br/>Phone: 1-800-CALL-DHL</p>
            </div>
            <div>
              <p style={{ margin: 0, fontWeight: 600, fontSize: '13px', color: 'var(--on-surface)' }}>Documentation</p>
              <a href="#" style={{ fontSize: '13px', color: 'var(--primary)', textDecoration: 'none' }}>View System Documentation</a>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

const styles = {
  page: {
    padding: '24px 32px',
    maxWidth: '900px',
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
  titleRow: { marginBottom: '24px' },
  title: {
    fontSize: '22px', fontWeight: 700, color: 'var(--on-surface)', margin: 0,
  },
  subtitle: { fontSize: '13px', color: '#888', marginTop: '4px' },
  sections: { display: 'flex', flexDirection: 'column', gap: '20px' },
  card: {
    background: '#fff', border: '1px solid var(--border-subtle)', borderRadius: '14px',
    boxShadow: 'var(--shadow-card)', padding: '24px',
  },
  cardHeader: {
    display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px',
    paddingBottom: '12px', borderBottom: '1px solid var(--border-subtle)',
  },
  cardTitle: { fontSize: '14px', fontWeight: 600, margin: 0, color: 'var(--on-surface)' },
  formGrid: {
    display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px 40px',
  },
  fieldGroup: {
    display: 'flex', flexDirection: 'column', gap: '6px',
  },
  label: {
    fontSize: '11px', fontWeight: 600, letterSpacing: '0.08em', color: '#888',
  },
  input: {
    width: '100%', height: '40px', padding: '0 14px', border: '1px solid var(--border-subtle)',
    borderRadius: '10px', fontSize: '14px', color: 'var(--on-surface)', background: '#fff', boxSizing: 'border-box',
  },
  roleBadge: {
    display: 'inline-block', padding: '4px 12px', background: 'var(--primary)',
    color: '#fff', fontSize: '11px', fontWeight: 700, borderRadius: '6px',
  },
  toggleList: { display: 'flex', flexDirection: 'column', gap: '0', maxWidth: '640px' },
  toggleRow: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '14px 0',
    borderBottom: '1px solid #f5f5f5',
  },
  toggleLabel: { fontWeight: 600, fontSize: '13px', margin: 0, color: 'var(--on-surface)' },
  toggleDesc: { fontSize: '11px', color: '#888', margin: '2px 0 0' },
  checkbox: {
    width: '18px', height: '18px', accentColor: '#D40511',
    cursor: 'pointer', flexShrink: 0,
  },
  secondaryBtn: {
    padding: '10px 24px', background: '#fff', border: '1px solid var(--primary)',
    color: 'var(--primary)', fontSize: '13px', fontWeight: 600, borderRadius: '10px',
    letterSpacing: '0.02em', cursor: 'pointer',
  },
  saveBtn: {
    padding: '10px 32px', background: '#D40511', color: '#fff',
    fontSize: '13px', fontWeight: 600, letterSpacing: '0.02em',
    border: 'none', borderRadius: '10px', cursor: 'pointer',
    boxShadow: '0 2px 8px rgba(212,5,17,0.3)',
    transition: 'all 0.2s',
  },
}
