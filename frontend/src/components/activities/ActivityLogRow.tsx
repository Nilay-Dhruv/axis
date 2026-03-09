import type { ReactElement } from 'react'
import type { ActivityLog } from '../../types/department'

interface Props {
  log: ActivityLog
  activityName?: string
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins  = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days  = Math.floor(diff / 86400000)
  if (mins < 1)   return 'just now'
  if (mins < 60)  return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  return `${days}d ago`
}

export default function ActivityLogRow({ log, activityName }: Props): ReactElement {
  const statusColor =
    log.status === 'completed' ? 'var(--success)'   :
    log.status === 'failed'    ? 'var(--danger)'     :
    'var(--warning)'

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 10,
        padding: '10px 0',
        borderBottom: '1px solid var(--border)',
      }}
    >
      {/* Status dot */}
      <div
        style={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: statusColor,
          boxShadow: `0 0 6px ${statusColor}`,
          flexShrink: 0,
          marginTop: 5,
        }}
      />

      <div style={{ flex: 1, minWidth: 0 }}>
        {activityName && (
          <div
            style={{
              fontSize: 12,
              fontWeight: 500,
              color: 'var(--text-primary)',
              marginBottom: 2,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {activityName}
          </div>
        )}
        {log.notes && (
          <div
            style={{
              fontSize: 11,
              color: 'var(--text-secondary)',
              lineHeight: 1.4,
              marginBottom: 2,
            }}
          >
            {log.notes}
          </div>
        )}
        <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>
          {timeAgo(log.executed_at)}
        </div>
      </div>

      <span
        style={{
          fontSize: 9,
          color: statusColor,
          fontFamily: 'Rajdhani',
          fontWeight: 700,
          letterSpacing: '0.12em',
          padding: '2px 6px',
          border: `1px solid ${statusColor}40`,
          borderRadius: 3,
          flexShrink: 0,
        }}
      >
        {log.status.toUpperCase()}
      </span>
    </div>
  )
}