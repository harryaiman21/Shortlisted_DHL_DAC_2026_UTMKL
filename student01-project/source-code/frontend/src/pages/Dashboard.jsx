import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'

function formatIncidentId(id) {
  const s = String(id)
  if (s.length <= 7) return 'INC-' + s.padStart(6, '0')
  return 'INC-' + s.slice(-6)
}

const STATUS_MAP = {
  Draft:         { color: '#6B7280', icon: 'edit_note',     bg: '#F3F4F6' },
  Reviewed:      { color: '#3B82F6', icon: 'rate_review',   bg: '#EFF6FF' },
  Published:     { color: '#27AE60', icon: 'verified',      bg: '#E8F5E9' },
  Open:          { color: '#E74C3C', icon: 'warning',       bg: '#FEF2F2' },
  'In Progress': { color: '#F39C12', icon: 'hourglass_top', bg: '#FFF8E1' },
  Resolved:      { color: '#27AE60', icon: 'check_circle',  bg: '#E8F5E9' },
}

const CATEGORIES = [
  'Late Delivery',
  'Damaged Parcel',
  'Address Issue',
  'System Error',
  'Customer Complaint',
]

export default function Dashboard() {
  const [incidents, setIncidents] = useState([])
  const [stats, setStats] = useState(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('')
  const [tagFilter, setTagFilter] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

  useEffect(() => {
    loadData()
  }, [search, statusFilter, categoryFilter, priorityFilter, tagFilter, dateFrom, dateTo])

  // Auto-refresh every 10 seconds so new incidents from MasterBot appear automatically
  useEffect(() => {
    const interval = setInterval(() => loadData(), 10000)
    return () => clearInterval(interval)
  }, [])

  async function loadData() {
    setLoading(true)
    try {
      const params = {}
      if (search) params.search = search
      if (statusFilter) params.status = statusFilter
      if (categoryFilter) params.category = categoryFilter
      if (priorityFilter) params.priority = priorityFilter
      if (tagFilter) params.tag = tagFilter
      const [incidentsRes, reportsRes] = await Promise.all([
        api.get('/incidents', { params }),
        api.get('/reports')
      ])

      let data = incidentsRes.data
      if (dateFrom || dateTo) {
        data = data.filter(i => {
          const d = new Date(i.created_at)
          const yyyy = d.getFullYear()
          const mm = String(d.getMonth() + 1).padStart(2, '0')
          const dd = String(d.getDate()).padStart(2, '0')
          const localDateStr = `${yyyy}-${mm}-${dd}`
          
          if (dateFrom && localDateStr < dateFrom) return false
          if (dateTo && localDateStr > dateTo) return false
          return true
        })
      }

      setIncidents(data)
      setStats(reportsRes.data)
    } catch (e) {
      console.error(e)
    }
    setLoading(false)
  }

  function clearFilters() {
    setSearch('')
    setStatusFilter('')
    setCategoryFilter('')
    setPriorityFilter('')
    setTagFilter('')
    setDateFrom('')
    setDateTo('')
  }

  const statCards = stats ? [
    { label: 'Total Incidents', value: stats.total, icon: 'analytics', color: '#6C63FF' },
    { label: 'Open', value: stats.by_status?.Open || 0, icon: 'warning', color: '#E74C3C' },
    { label: 'In Progress', value: stats.by_status?.['In Progress'] || 0, icon: 'hourglass_top', color: '#F39C12' },
    { label: 'Resolved', value: stats.by_status?.Resolved || 0, icon: 'check_circle', color: '#27AE60' },
  ] : []

  return (
    <div style={styles.page} className="dashboard-page">
      <style>{`
        @media (max-width: 768px) {
          .dashboard-page { padding: 16px !important; }
        }
      `}</style>

      {/* Header */}
      <header style={styles.header}>
        <div>
          <h2 style={styles.title}>Dashboard</h2>
          <p style={styles.subtitle}>{today}</p>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            style={styles.newBtn}
            onClick={() => navigate('/submit')}
            onMouseEnter={e => e.currentTarget.style.background = '#B0000E'}
            onMouseLeave={e => e.currentTarget.style.background = '#D40511'}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add</span>
            New Incident
          </button>
        </div>
      </header>

      {/* Stats Grid */}
      <section style={styles.statsGrid}>
        {statCards.map(card => (
          <div key={card.label} style={styles.statCard}>
            <div style={styles.statTop}>
              <span style={styles.statLabel}>{card.label}</span>
              <div style={{ ...styles.statIconWrap, background: card.color + '15' }}>
                <span className="material-symbols-outlined" style={{ color: card.color, fontSize: '20px' }}>{card.icon}</span>
              </div>
            </div>
            <span style={styles.statValue}>{card.value}</span>
          </div>
        ))}
      </section>

      {/* Filters */}
      <section style={{ marginBottom: '16px' }}>
        {/* Row 1 — Search */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '10px', flexWrap: 'wrap' }}>
          <div style={styles.searchWrapper}>
            <span className="material-symbols-outlined" style={styles.searchIcon}>search</span>
            <input
              type="text"
              placeholder="Search by ID (e.g. 100001), title, keyword..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={styles.searchInput}
            />
          </div>
        </div>

        {/* Row 2 — Filters */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={styles.filterSelect}>
            <option value="">All Status</option>
            <option value="Draft">Draft</option>
            <option value="Reviewed">Reviewed</option>
            <option value="Published">Published</option>
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
          </select>

          <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} style={styles.filterSelect}>
            <option value="">All Categories</option>
            {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>

          <select value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)} style={styles.filterSelect}>
            <option value="">All Priority</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          <select value={tagFilter} onChange={e => setTagFilter(e.target.value)} style={styles.filterSelect}>
            <option value="">All Tags</option>
            <option value="late-delivery">late-delivery</option>
            <option value="damaged-parcel">damaged-parcel</option>
            <option value="address-issue">address-issue</option>
            <option value="system-error">system-error</option>
            <option value="customer-complaint">customer-complaint</option>
            <option value="tracking">tracking</option>
            <option value="refund">refund</option>
            <option value="urgent">urgent</option>
            <option value="warehouse">warehouse</option>
            <option value="misdelivery">misdelivery</option>
          </select>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '12px', color: '#888', whiteSpace: 'nowrap' }}>From:</span>
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
              style={{ ...styles.filterSelect, minWidth: '140px', padding: '8px 10px' }} />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '12px', color: '#888', whiteSpace: 'nowrap' }}>To:</span>
            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
              style={{ ...styles.filterSelect, minWidth: '140px', padding: '8px 10px' }} />
          </div>

          {(search || statusFilter || categoryFilter || priorityFilter || tagFilter || dateFrom || dateTo) && (
            <button onClick={clearFilters} style={{
              padding: '8px 14px', borderRadius: '10px', border: '1px solid #ddd',
              background: '#fff', cursor: 'pointer', fontSize: '12px',
              color: '#888', display: 'flex', alignItems: 'center', gap: '4px'
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>close</span>
              Clear
            </button>
          )}
        </div>
      </section>

      {/* Table */}
      <section style={styles.tableCard}>
        <div style={styles.tableHeader}>
          <h3 style={styles.tableTitle}>Recent Incidents</h3>
          <span style={styles.tableCount}>{incidents.length} records</span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>ID</th>
                <th style={styles.th}>Customer Name</th>
                <th style={styles.th}>Title</th>
                <th style={styles.th}>Category</th>
                <th style={styles.th}>Priority</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Date</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} style={{ ...styles.td, textAlign: 'center', padding: '40px' }}>Loading...</td></tr>
              ) : incidents.length === 0 ? (
                <tr><td colSpan={6} style={{ ...styles.td, textAlign: 'center', padding: '40px', color: '#999' }}>No incidents found</td></tr>
              ) : (
                incidents.map(inc => {
                  const sm = STATUS_MAP[inc.status] || STATUS_MAP.Open
                  return (
                    <tr
                      key={inc.id}
                      style={styles.tr}
                      onClick={() => navigate(`/incidents/${inc.id}`)}
                      onMouseEnter={e => e.currentTarget.style.background = '#f8f7ff'}
                      onMouseLeave={e => e.currentTarget.style.background = ''}
                    >
                      <td style={styles.td}>
                        <span style={styles.idBadge}>{formatIncidentId(inc.id)}</span>
                      </td>
                      <td style={{ ...styles.td, maxWidth: '140px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span className="material-symbols-outlined" style={{ fontSize: '14px', color: '#aaa' }}>person</span>
                          <span style={{ fontSize: '12px', color: '#555' }}>{inc.customer_name || 'Unknown'}</span>
                        </div>
                      </td>
                      <td style={{ ...styles.td, fontWeight: 500, maxWidth: '300px' }}>
                        {inc.title || 'Untitled'}
                        {inc.is_duplicate && (
                          <span style={styles.dupBadge}>DUPLICATE</span>
                        )}
                      </td>
                      <td style={styles.td}>
                        <span style={styles.categoryBadge}>{inc.category || 'N/A'}</span>
                      </td>
                      <td style={styles.td}>
                        <span style={{
                          ...styles.priorityBadge,
                          color: inc.priority === 'High' ? '#E74C3C' : inc.priority === 'Medium' ? '#F39C12' : '#27AE60',
                        }}>
                          {inc.priority || 'N/A'}
                        </span>
                      </td>
                      <td style={styles.td}>
                        <span style={{
                          ...styles.statusPill,
                          color: sm.color,
                          background: sm.bg,
                        }}>
                          <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>{sm.icon}</span>
                          {inc.status}
                        </span>
                      </td>
                      <td style={{ ...styles.td, color: '#999', fontSize: '13px' }}>
                        {new Date(inc.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

    </div>
  )
}

const styles = {
  page: {
    padding: '24px 32px',
    maxWidth: '1440px',
    margin: '0 auto',
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
  newBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 24px',
    background: '#D40511',
    color: '#fff',
    fontWeight: 600,
    fontSize: '13px',
    borderRadius: '10px',
    border: 'none',
    cursor: 'pointer',
    boxShadow: '0 2px 8px rgba(212,5,17,0.3)',
    transition: 'all 0.2s',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
    marginBottom: '24px',
  },
  statCard: {
    background: '#fff',
    borderRadius: '14px',
    padding: '20px',
    boxShadow: 'var(--shadow-card)',
    border: '1px solid var(--border-subtle)',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  statTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  statLabel: {
    fontSize: '12px',
    fontWeight: 500,
    color: '#888',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  statIconWrap: {
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    fontSize: '28px',
    fontWeight: 700,
    color: 'var(--on-surface)',
  },
  filtersRow: {
    display: 'flex',
    gap: '12px',
    marginBottom: '16px',
    flexWrap: 'wrap',
  },
  searchWrapper: {
    position: 'relative',
    flex: 1,
    minWidth: '250px',
  },
  searchIcon: {
    position: 'absolute',
    left: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#aaa',
    fontSize: '20px',
  },
  searchInput: {
    width: '100%',
    padding: '10px 14px 10px 40px',
    border: '1px solid var(--border-subtle)',
    borderRadius: '10px',
    fontSize: '14px',
    height: '40px',
    background: '#fff',
    boxSizing: 'border-box',
    boxShadow: 'var(--shadow-card)',
  },
  filterSelect: {
    padding: '10px 14px',
    border: '1px solid var(--border-subtle)',
    borderRadius: '10px',
    fontSize: '14px',
    height: '40px',
    background: '#fff',
    minWidth: '160px',
    cursor: 'pointer',
    boxShadow: 'var(--shadow-card)',
  },
  tableCard: {
    background: '#fff',
    borderRadius: '14px',
    boxShadow: 'var(--shadow-card)',
    border: '1px solid var(--border-subtle)',
    overflow: 'hidden',
  },
  tableHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 20px',
    borderBottom: '1px solid var(--border-subtle)',
  },
  tableTitle: {
    fontSize: '15px',
    fontWeight: 600,
    margin: 0,
    color: 'var(--on-surface)',
  },
  tableCount: {
    fontSize: '12px',
    color: '#999',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  th: {
    textAlign: 'left',
    padding: '12px 16px',
    fontSize: '11px',
    fontWeight: 600,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: '#999',
    background: '#fafafa',
    borderBottom: '1px solid var(--border-subtle)',
    whiteSpace: 'nowrap',
  },
  tr: {
    cursor: 'pointer',
    transition: 'background 0.15s',
    borderBottom: '1px solid #f5f5f5',
  },
  td: {
    padding: '14px 16px',
    fontSize: '13px',
    color: '#444',
    whiteSpace: 'nowrap',
  },
  idBadge: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: '12px',
    fontWeight: 600,
    color: '#888',
  },
  dupBadge: {
    display: 'inline-block',
    marginLeft: '8px',
    padding: '2px 6px',
    background: '#F39C12',
    color: '#fff',
    fontSize: '10px',
    fontWeight: 700,
    borderRadius: '4px',
    verticalAlign: 'middle',
  },
  categoryBadge: {
    display: 'inline-block',
    padding: '3px 10px',
    background: '#f5f5f5',
    border: '1px solid #eee',
    borderRadius: '6px',
    fontSize: '11px',
    fontWeight: 500,
    color: '#555',
  },
  priorityBadge: {
    fontWeight: 700,
    fontSize: '12px',
  },
  statusPill: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '4px 10px',
    borderRadius: '8px',
    fontSize: '11px',
    fontWeight: 600,
  },
}