import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useEffect } from 'react'

const DHL_LOGO = 'https://lh3.googleusercontent.com/aida-public/AB6AXuAaNPqYkfrZR2F_zoUsrtpdKGErVDGcjveM-3DjV_gedqOqg6w2vocb8b4hg2aVrxcENNfxKxAKKRmQkyhhWoBVbyCM8CDizCuIr4h5QVis1ki0uZlHV9UKZC-UFpP_KO17tm4qw_o1tx2u50C2U1Ew-1OHLyLHaM-Wli5lq_lDMqaZ563_QmL_FoJrzFmM4X0epPOtdqGMCt_0H_hs_CWbhz1VjHTdfeo2XMz0EhnN5_nIgztujWHN24jliRAAAzQ4JhIjxM4665Wv1w'

const navItems = [
  { path: '/', icon: 'dashboard', label: 'Dashboard' },
  { path: '/submit', icon: 'report_problem', label: 'New Incident' },
  { path: '/reports', icon: 'assessment', label: 'Reports' },
  { path: '/reports/category', icon: 'category', label: 'Category Report' },
  { path: '/settings', icon: 'settings', label: 'Settings' },
]

export default function Sidebar({ isOpen, onClose }) {
  const navigate = useNavigate()
  const location = useLocation()

  // Close sidebar on navigation for mobile
  useEffect(() => {
    if (window.innerWidth <= 768) {
      onClose()
    }
  }, [location.pathname]) // Only trigger when path actually changes

  function logout() {
    localStorage.clear()
    navigate('/login')
  }

  return (
    <>
      <nav className={`app-sidebar ${isOpen ? 'open' : ''}`}>
        {/* Brand */}
        <div style={styles.brand}>
          <img src={DHL_LOGO} alt="DHL Logo" style={styles.logo} />
          <p style={styles.subtitle}>Incident Management</p>
        </div>

        {/* Nav Links */}
        <ul style={styles.navList}>
          {navItems.map(item => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                end={item.path === '/' || item.path === '/reports'}
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                style={styles.navLinkBase}
              >
                <span
                  className="material-symbols-outlined icon"
                  style={{ fontSize: '20px', fontVariationSettings: "'FILL' 0" }}
                >
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>

        {/* Logout */}
        <div style={styles.logoutArea}>
          <button onClick={logout} style={styles.logoutBtn}>
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>logout</span>
            <span>Logout</span>
          </button>
        </div>
      </nav>

      <style>{`
        .app-sidebar {
          width: 256px;
          height: 100vh;
          position: sticky;
          top: 0;
          flex-shrink: 0;
          background: #1a1a2e;
          display: flex;
          flex-direction: column;
          padding: 24px 0;
          z-index: 40;
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .nav-link {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 20px;
          color: rgba(255,255,255,0.65);
          font-size: 13px;
          font-weight: 500;
          text-decoration: none;
          border-left: 3px solid transparent;
          transition: all 0.15s;
          width: 100%;
        }

        .nav-link:hover {
          color: #fff;
          background: rgba(255,255,255,0.05);
        }

        .nav-link.active {
          border-left-color: #FECB00;
          background: rgba(255,255,255,0.08);
          color: #FECB00;
          font-weight: 600;
        }

        @media (max-width: 768px) {
          .app-sidebar {
            position: fixed !important;
            left: 0;
            top: 0;
            transform: translateX(-100%);
            box-shadow: 4px 0 12px rgba(0,0,0,0.2);
            pointer-events: none; /* Allow clicks to pass through when closed */
            visibility: hidden; /* Ensure it's truly invisible to the browser when closed */
          }
          .app-sidebar.open {
            transform: translateX(0);
            pointer-events: auto; /* Re-enable clicks when open */
            visibility: visible;
          }
        }
      `}</style>
    </>
  )
}

const styles = {
  brand: {
    padding: '0 20px',
    marginBottom: '32px',
  },
  logo: {
    height: '32px',
    width: 'auto',
    objectFit: 'contain',
    marginBottom: '8px',
  },
  subtitle: {
    fontSize: '11px',
    fontWeight: 500,
    color: 'rgba(255,255,255,0.5)',
    margin: 0,
  },
  navList: {
    listStyle: 'none',
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    flex: 1,
    padding: 0,
    margin: 0,
  },
  logoutArea: {
    padding: '0',
    marginTop: 'auto',
  },
  logoutBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '10px 20px',
    color: 'rgba(255,255,255,0.65)',
    fontSize: '13px',
    fontWeight: 500,
    textDecoration: 'none',
    borderLeft: '3px solid transparent',
    width: '100%',
    cursor: 'pointer',
    background: 'none',
    border: 'none',
  },
}
