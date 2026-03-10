import { useState, useEffect, type ReactElement } from 'react'
import { useLocation } from 'react-router-dom'
import api from '../../services/api'

const ROUTE_TITLES: Record<string, string> = {
  '/dashboard':   'Dashboard',
  '/departments': 'Departments',
  '/activities':  'Activities',
  '/outcomes':    'Outcomes',
  '/signals':     'Signals',
  '/analytics':   'Analytics',
  '/roles':       'Roles',
  '/settings':    'Settings',
  '/automations': 'Automations',
  '/decisions':   'Decisions',
  '/simulations': 'Simulations',
}

interface AlertSignal {
  id:     string
  name:   string
  status: 'critical' | 'warning'
  value:  number
}

interface Props { onMenuClick: () => void }

export default function Header({ onMenuClick }: Props): ReactElement {
  const location   = useLocation()
  const title      = ROUTE_TITLES[location.pathname] ?? 'AXIS'
  const [notifOpen, setNotifOpen] = useState(false)
  const [alerts, setAlerts]       = useState<AlertSignal[]>([])

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  })

  // Load alert signals from backend
  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get<{
          success: boolean
          data: { alerts: AlertSignal[] }
        }>('/outcomes/alerts')
        setAlerts(res.data.data.alerts ?? [])
      } catch {
        // silently fail — notifications are non-critical
      }
    }
    void load()
  }, [])

  const criticalCount = alerts.filter((a) => a.status === 'critical').length
  const hasAlerts     = alerts.length > 0

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
        <div style={{ fontSize: 11, color: '#8096aa', marginTop: 1 }}>{today}</div>
      </div>

      {/* Status pill */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6,
        background: criticalCount > 0 ? 'rgba(180,70,70,0.08)' : '#e6f7f0',
        borderRadius: 30,
        padding: '5px 12px',
        fontSize: 11, fontWeight: 700,
        color: criticalCount > 0 ? '#b44646' : '#1e9e60',
        transition: 'all 0.3s',
      }}>
        <div style={{
          width: 6, height: 6, borderRadius: '50%',
          background: criticalCount > 0 ? '#b44646' : '#1e9e60',
        }} />
        {criticalCount > 0 ? `${criticalCount} Critical` : 'Systems Online'}
      </div>

      {/* Notif button */}
      <div style={{ position: 'relative' }}>
        <button
          onClick={() => setNotifOpen((o) => !o)}
          style={{
            width: 36, height: 36, borderRadius: 10,
            background: '#e6ecf3',
            boxShadow: notifOpen
              ? 'inset 3px 3px 8px #c3cdd8, inset -3px -3px 8px #ffffff'
              : '4px 4px 10px #c8d2de, -4px -4px 10px #ffffff',
            border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16, color: '#4a5e72', position: 'relative',
            transition: 'box-shadow 0.2s',
          }}
        >
          🔔
          {hasAlerts && (
            <span style={{
              position: 'absolute', top: 6, right: 6,
              width: 7, height: 7, borderRadius: '50%',
              background: criticalCount > 0 ? '#b44646' : '#c4a45a',
              border: '1.5px solid #e6ecf3',
            }} />
          )}
        </button>

        {notifOpen && (
          <>
            {/* Click-outside overlay */}
            <div
              onClick={() => setNotifOpen(false)}
              style={{
                position: 'fixed', inset: 0, zIndex: 90,
              }}
            />
            <div style={{
              position: 'absolute', top: 44, right: 0,
              width: 300,
              background: '#e6ecf3',
              borderRadius: 18,
              boxShadow: '8px 8px 20px #c3cdd8, -8px -8px 20px #ffffff',
              zIndex: 100,
              overflow: 'hidden',
              animation: 'fadeSlideIn 0.2s ease',
            }}>
              {/* Header */}
              <div style={{
                padding: '14px 18px',
                borderBottom: '1px solid #d4e0ec',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <span style={{ fontWeight: 700, fontSize: 13, color: '#1a2635' }}>
                  Signal Alerts
                </span>
                <span style={{
                  fontSize: 10, fontFamily: 'Rajdhani', fontWeight: 700,
                  color: '#8096aa', letterSpacing: '0.08em',
                }}>
                  {alerts.length} ACTIVE
                </span>
              </div>

              {/* Alert list */}
              {alerts.length === 0 ? (
                <div style={{
                  padding: '28px 18px', textAlign: 'center',
                  fontSize: 12, color: '#8096aa',
                }}>
                  <div style={{ fontSize: 24, marginBottom: 8, opacity: 0.4 }}>◎</div>
                  All signals normal
                </div>
              ) : (
                alerts.slice(0, 5).map((alert, i) => (
                  <div key={alert.id} style={{
                    padding: '12px 18px',
                    borderBottom: i < Math.min(alerts.length, 5) - 1
                      ? '1px solid #d4e0ec'
                      : 'none',
                    display: 'flex', gap: 10, alignItems: 'flex-start',
                  }}>
                    <span style={{
                      color:     alert.status === 'critical' ? '#b44646' : '#c4a45a',
                      fontSize:  12,
                      marginTop: 2,
                      flexShrink: 0,
                    }}>
                      {alert.status === 'critical' ? '▲' : '◆'}
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: 12, color: '#1a2635', fontWeight: 600,
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {alert.name}
                      </div>
                      <div style={{ fontSize: 10, color: '#8096aa', marginTop: 2 }}>
                        Value: {alert.value} ·{' '}
                        <span style={{
                          color: alert.status === 'critical' ? '#b44646' : '#c4a45a',
                          fontWeight: 700, textTransform: 'uppercase',
                        }}>
                          {alert.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}

              {/* Footer */}
              <div style={{
                padding: '10px 18px',
                borderTop: '1px solid #d4e0ec',
                textAlign: 'center',
              }}>
                <a
                  href="/signals"
                  onClick={() => setNotifOpen(false)}
                  style={{
                    fontSize: 11, fontFamily: 'Rajdhani', fontWeight: 700,
                    color: '#5aa9c4', textDecoration: 'none', letterSpacing: '0.06em',
                  }}
                >
                  VIEW ALL SIGNALS →
                </a>
              </div>
            </div>
          </>
        )}
      </div>
    </header>
  )
}