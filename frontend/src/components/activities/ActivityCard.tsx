import type { ReactElement } from 'react'
import type { Activity } from '../../types/department'
import ActivityTypeBadge from './ActivityTypeBadge'

interface Props {
  activity: Activity
  deptColor: string
  onExecute: (activity: Activity) => void
  onSelect: (activity: Activity) => void
  isSelected: boolean
}

const TIER_LABELS: Record<string, { label: string; color: string }> = {
  free:          { label: 'FREE',    color: 'var(--text-muted)' },
  basic_premium: { label: 'BASIC',   color: 'var(--warning)'    },
  premium:       { label: 'PRO',     color: 'var(--cyan)'       },
}

export default function ActivityCard({
  activity,
  deptColor,
  onExecute,
  onSelect,
  isSelected,
}: Props): ReactElement {
  const tierCfg = TIER_LABELS[activity.tier_required] ?? TIER_LABELS['free']

  return (
    <div
      style={{
        background: isSelected ? `${deptColor}06` : 'var(--bg-surface)',
        border: `1px solid ${isSelected ? deptColor : 'var(--border)'}`,
        borderRadius: 8,
        padding: '16px 18px',
        transition: 'all 0.2s ease',
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden',
      }}
      onClick={() => onSelect(activity)}
      className="group"
    >
      {/* Left accent bar */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: 2,
          background: deptColor,
          opacity: isSelected ? 1 : 0,
          transition: 'opacity 0.2s',
        }}
        className="group-hover:opacity-100"
      />

      {/* Top row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 8,
          marginBottom: 8,
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: 'var(--text-primary)',
              marginBottom: 6,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {activity.name}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <ActivityTypeBadge type={activity.type} />
            {activity.tier_required !== 'free' && (
              <span
                style={{
                  fontSize: 9,
                  color: tierCfg.color,
                  fontFamily: 'Rajdhani',
                  fontWeight: 700,
                  letterSpacing: '0.15em',
                  padding: '2px 5px',
                  border: `1px solid ${tierCfg.color}50`,
                  borderRadius: 3,
                }}
              >
                {tierCfg.label}
              </span>
            )}
          </div>
        </div>

        {/* Execute button */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            onExecute(activity)
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            padding: '6px 12px',
            background: 'transparent',
            border: `1px solid ${deptColor}50`,
            borderRadius: 6,
            color: deptColor,
            fontSize: 10,
            cursor: 'pointer',
            fontFamily: 'Rajdhani',
            fontWeight: 700,
            letterSpacing: '0.1em',
            transition: 'all 0.15s',
            whiteSpace: 'nowrap',
            flexShrink: 0,
          }}
          className="hover:bg-cyan-glow"
        >
          ▶ RUN
        </button>
      </div>

      {/* Description */}
      {activity.description && (
        <div
          style={{
            fontSize: 12,
            color: 'var(--text-muted)',
            lineHeight: 1.5,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {activity.description}
        </div>
      )}
    </div>
  )
}