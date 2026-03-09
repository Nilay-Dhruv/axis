import { useState, useEffect, type ReactElement } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'

export default function MainLayout(): ReactElement {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  useEffect(() => {
    const handler = () => setSidebarOpen(window.innerWidth >= 1024)
    handler()
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #dde8f4 0%, #e8eef8 40%, #d8e4f0 70%, #e2ecf6 100%)',
      fontFamily: "'Plus Jakarta Sans', sans-serif",
    }}>

      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main content */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        marginLeft: sidebarOpen ? 260 : 0,
        transition: 'margin-left 0.3s ease',
        minWidth: 0,
      }}>
        <Header onMenuClick={() => setSidebarOpen((o) => !o)} />

        <main style={{
          flex: 1,
          padding: '28px 28px',
          overflowY: 'auto',
        }}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}