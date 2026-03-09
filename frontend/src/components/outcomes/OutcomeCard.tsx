import type { ReactElement } from 'react'
import type { Outcome } from '../../types/department'

interface Props {
  outcome: Outcome
  deptColor: string
  progress: number
  onClick: (id: string) => void
  isSelected: boolean
}

const STATUS_CONFIG: Record<string, { color: string; label: string; icon: string }> = {
  active:   { color: 'var(--cyan)',    label: 'ACTIVE',   icon: '◎' },
  achieved: { color: 'var(--success)', label: 'ACHIEVED', icon: '◆' },
  at_risk:  { color: 'var(--danger)',  label: 'AT RISK',  icon: '⚠' },
  inactive: { color: 'var(--text-muted)', label: 'INACTIVE', icon: '◇' },
}

function formatValue(value: number | null, unit: string | null): string {
  if (value === null) return '—'
  if (unit === 'USD') {
    return value >= 1000000
      ? `$${(value / 1000000).toFixed(1)}M`
      : value >= 1000
      ? `$${(value / 1000).toFixed(0)}K`
      : `$${value}`
  }
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`
  return `${value}${unit === '%' ? '%' : ''}`
}

export default function OutcomeCard({
  outcome,
  deptColor,
  progress,
  onClick,
  isSelected,
}: Props): ReactElement {
  const cfg = STATUS_CONFIG[outcome.status] ?? STATUS_CONFIG.active
  const progressColor =
    progress >= 100 ? 'var(--success)' :
    progress < 50   ? 'var(--danger)'  :
    progress < 75   ? 'var(--warning)' :
    deptColor

  return (
    <button
      onClick={() => onClick(outcome.id)}
      style={{
        width: '100%',
        textAlign: 'left',
        background: isSelected ? `${deptColor}08` : 'var(--bg-surface)',
        border: `1px solid ${isSelected ? deptColor : 'var(--border)'}`,
        borderRadius: 8,
        padding: '16px 18px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        position: 'relative',
        overflow: 'hidden',
      }}
      className="group"
    >
      {/* Left accent */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: 2,
          background: cfg.color,
          opacity: isSelected ? 1 : 0,
          transition: 'opacity 0.2s',
        }}
        className="group-hover:opacity-100"
      />

      {/* Header row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 8,
          marginBottom: 10,
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: 'var(--text-primary)',
              marginBottom: 4,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {outcome.name}
          </div>
          {outcome.description && (
            <div
              style={{
                fontSize: 11,
                color: 'var(--text-muted)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {outcome.description}
            </div>
          )}
        </div>

        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            fontSize: 9,
            color: cfg.color,
            fontFamily: 'Rajdhani',
            fontWeight: 700,
            letterSpacing: '0.12em',
            padding: '2px 7px',
            border: `1px solid ${cfg.color}40`,
            borderRadius: 3,
            flexShrink: 0,
            background: `${cfg.color}10`,
          }}
        >
          {cfg.icon} {cfg.label}
        </span>
      </div>

      {/* Values row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          marginBottom: 10,
        }}
      >
        <div>
          <div
            style={{
              fontSize: 22,
              fontFamily: 'Rajdhani',
              fontWeight: 700,
              color: progressColor,
              lineHeight: 1,
              marginBottom: 2,
            }}
          >
            {formatValue(outcome.current_value, outcome.unit)}
          </div>
          <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>
            of {formatValue(outcome.target_value, outcome.unit)} target
            {outcome.unit && outcome.unit !== 'USD' && outcome.unit !== '%'
              ? ` ${outcome.unit}`
              : ''}
          </div>
        </div>

        <div
          style={{
            fontSize: 26,
            fontFamily: 'Rajdhani',
            fontWeight: 700,
            color: progressColor,
            lineHeight: 1,
          }}
        >
          {outcome.target_value ? `${Math.round(progress)}%` : '—'}
        </div>
      </div>

      {/* Progress bar */}
      {outcome.target_value !== null && (
        <div
          style={{
            height: 4,
            background: 'var(--border)',
            borderRadius: 2,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${progress}%`,
              background: progressColor,
              borderRadius: 2,
              transition: 'width 0.5s ease',
              boxShadow: progress > 0 ? `0 0 6px ${progressColor}` : 'none',
            }}
          />
        </div>
      )}
    </button>
  )
}