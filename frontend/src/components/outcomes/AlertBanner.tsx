import { useState, type ReactElement } from 'react'
import type { Signal } from '../../types/department'

interface Props {
  alerts: Signal[]
}

export default function AlertBanner({ alerts }: Props): ReactElement | null {
  const [dismissed, setDismissed] = useState(false)

  if (alerts.length === 0 || dismissed) return null

  const critical = alerts.filter((a) => a.status === 'critical')
  const warning  = alerts.filter((a) => a.status === 'warning')
  const color    = critical.length > 0 ? 'var(--danger)' : 'var(--warning)'
  const bg       = critical.length > 0 ? 'rgba(255,68,85,0.08)' : 'rgba(255,170,0,0.08)'
  const border   = critical.length > 0 ? 'rgba(255,68,85,0.3)' : 'rgba(255,170,0,0.3)'

  return (
    <div
      style={{
        background: bg,
        border: `1px solid ${border}`,
        borderRadius: 8,
        padding: '12px 16px',
        marginBottom: 20,
        animation: 'fadeSlideIn 0.2s ease',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 12,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, flex: 1 }}>
          <span style={{ fontSize: 16, color, marginTop: 1 }}>⚠</span>
          <div>
            <div
              style={{
                fontSize: 12,
                fontWeight: 600,
                color,
                marginBottom: 4,
              }}
            >
              {critical.length > 0
                ? `${critical.length} critical signal${critical.length > 1 ? 's' : ''} detected`
                : `${warning.length} signal${warning.length > 1 ? 's' : ''} in warning state`}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {alerts.slice(0, 4).map((alert) => (
                <span
                  key={alert.id}
                  style={{
                    fontSize: 10,
                    color,
                    padding: '1px 6px',
                    border: `1px solid ${color}40`,
                    borderRadius: 3,
                    fontFamily: 'Rajdhani',
                    fontWeight: 600,
                    letterSpacing: '0.06em',
                  }}
                >
                  {alert.name}
                </span>
              ))}
              {alerts.length > 4 && (
                <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                  +{alerts.length - 4} more
                </span>
              )}
            </div>
          </div>
        </div>

        <button
          onClick={() => setDismissed(true)}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            fontSize: 12,
            padding: 4,
            flexShrink: 0,
          }}
        >
          ✕
        </button>
      </div>
    </div>
  )
}