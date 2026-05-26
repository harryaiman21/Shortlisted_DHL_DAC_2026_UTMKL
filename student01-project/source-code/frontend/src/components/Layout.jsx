import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'

export default function Layout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen)
  const closeSidebar = () => setIsSidebarOpen(false)

  return (
    <div className="app-shell">
      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />

      {/* Backdrop */}
      {isSidebarOpen && (
        <div className="mobile-backdrop" onClick={closeSidebar} />
      )}

      {/* Content Area */}
      <div className="content-wrapper">
        <header className="mobile-header">
          <button onClick={toggleSidebar} className="menu-btn">
            <span className="material-symbols-outlined">menu</span>
          </button>
          <div className="mobile-title">Incident System</div>
          <div style={{ width: '40px' }} />
        </header>

        <main className="main-content">
          <Outlet />
        </main>
      </div>

      <style>{`
        .app-shell {
          display: flex;
          min-height: 100vh;
          width: 100%;
          background: var(--background);
        }

        .content-wrapper {
          display: flex;
          flex-direction: column;
          flex: 1;
          min-width: 0;
        }

        .main-content {
          flex: 1;
          overflow-x: hidden;
          overflow-y: auto;
          width: 100%;
        }

        .mobile-header {
          display: none;
          width: 100%;
          height: 52px;
          background: #D40511;
          align-items: center;
          justify-content: space-between;
          padding: 0 8px;
          color: #fff;
          flex-shrink: 0;
        }

        .menu-btn {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          background: none;
          border: none;
          color: #fff;
        }

        .mobile-title {
          font-size: 16px;
          font-weight: 700;
        }

        .mobile-backdrop {
          display: none;
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.4);
          z-index: 35;
          backdrop-filter: blur(2px);
        }

        @media (max-width: 768px) {
          .app-shell {
            display: block; /* Break flex on mobile to ensure header/main stack and sidebar doesn't push */
          }
          .mobile-header {
            display: flex;
            position: sticky;
            top: 0;
            z-index: 30;
          }
          .mobile-backdrop {
            display: block;
          }
          .content-wrapper {
            display: block;
            width: 100%;
            margin-left: 0 !important;
            padding-left: 0 !important;
          }
        }
      `}</style>
    </div>
  )
}
