import { useState, type ReactElement } from 'react'
import { useLocation } from 'react-router-dom'

const ROUTE_TITLES: Record<string, string> = {
  '/dashboard':   'Dashboard',
  '/departments': 'Departments',
  '/activities':  'Activities',
  '/outcomes':    'Outcomes',
  '/signals':     'Signals',
  '/analytics':   'Analytics',
  '/roles':       'Roles',
  '/settings':    'Settings',
}

interface Props { onMenuClick: () => void }

export default function Header({ onMenuClick }: Props): ReactElement {
  const location = useLocation()
  const title    = ROUTE_TITLES[location.pathname] ?? 'AXIS'
  const [notifOpen, setNotifOpen] = useState(false)

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  })

  return (
    <header style={{
      height: 68,
      background: '#e6ecf3',
      boxShadow: '0 4px 16px rgba(195,205,216,0.5)',
      display: 'flex',
      alignItems: 'center',
      padding: '0 28px',
      gap: 16,
      position: 'sticky',
      top: 0,
      zIndex: 30,
    }}>

      {/* Menu toggle */}
      <button
        onClick={onMenuClick}
        style={{
          width: 36, height: 36, borderRadius: 10,
          background: '#e6ecf3',
          boxShadow: '4px 4px 10px #c8d2de, -4px -4px 10px #ffffff',
          border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 16, color: '#4a5e72',
          transition: 'all 0.15s',
          flexShrink: 0,
        }}
      >
        ☰
      </button>

      {/* Title */}
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 800, fontSize: 16, color: '#1a2635', letterSpacing: '-0.2px' }}>
          {title}
        </div>
        <div style={{ fontSize: 11, color: '#8096aa', marginTop: 1 }}>
          {today}
        </div>
      </div>

      {/* Status pill */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6,
        background: '#e6f7f0',
        borderRadius: 30,
        padding: '5px 12px',
        fontSize: 11, fontWeight: 700, color: '#1e9e60',
      }}>
        <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#1e9e60' }} />
        Systems Online
      </div>

      {/* Notif button */}
      <div style={{ position: 'relative' }}>
        <button
          onClick={() => setNotifOpen((o) => !o)}
          style={{
            width: 36, height: 36, borderRadius: 10,
            background: '#e6ecf3',
            boxShadow: '4px 4px 10px #c8d2de, -4px -4px 10px #ffffff',
            border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16, color: '#4a5e72', position: 'relative',
          }}
        >
          🔔
          <span style={{
            position: 'absolute', top: 6, right: 6,
            width: 7, height: 7, borderRadius: '50%',
            background: '#b92c2c',
            border: '1.5px solid #e6ecf3',
          }} />
        </button>

        {notifOpen && (
          <div style={{
            position: 'absolute', top: 44, right: 0,
            width: 280,
            background: '#e6ecf3',
            borderRadius: 18,
            boxShadow: '8px 8px 20px #c3cdd8, -8px -8px 20px #ffffff',
            zIndex: 100,
            overflow: 'hidden',
            animation: 'fadeSlideIn 0.2s ease',
          }}>
            <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--divider)' }}>
              <span style={{ fontWeight: 700, fontSize: 13, color: '#1a2635' }}>Notifications</span>
            </div>
            {[
              { icon: '▲', text: 'Signal threshold breached in Finance', time: '2m ago', color: '#b92c2c' },
              { icon: '◆', text: 'Q4 Revenue outcome updated',          time: '1h ago', color: '#1e9e60' },
              { icon: '◈', text: 'New department added: Engineering',   time: '3h ago', color: '#5aa9c4' },
            ].map((n, i) => (
              <div key={i} style={{
                padding: '12px 18px',
                borderBottom: i < 2 ? '1px solid var(--divider)' : 'none',
                display: 'flex', gap: 10, alignItems: 'flex-start',
              }}>
                <span style={{ color: n.color, fontSize: 12, marginTop: 2 }}>{n.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, color: '#1a2635', fontWeight: 600, lineHeight: 1.4 }}>{n.text}</div>
                  <div style={{ fontSize: 10, color: '#8096aa', marginTop: 3 }}>{n.time}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </header>
  )
}