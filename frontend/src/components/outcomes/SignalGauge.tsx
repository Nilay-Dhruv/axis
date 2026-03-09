import type { ReactElement } from 'react'
import type { Signal } from '../../types/department'

interface Props {
  signal: Signal
  compact?: boolean
}

const STATUS_CONFIG = {
  normal:   { color: 'var(--success)', label: 'NORMAL',   icon: '◆' },
  warning:  { color: 'var(--warning)', label: 'WARNING',  icon: '▲' },
  critical: { color: 'var(--danger)',  label: 'CRITICAL', icon: '⚠' },
}

function getBarPosition(signal: Signal): number {
  const { value, threshold_min, threshold_max } = signal
  if (value === null) return 50
  if (threshold_min !== null && threshold_max !== null) {
    const range = threshold_max - threshold_min
    const pos = ((value - threshold_min) / range) * 100
    return Math.max(0, Math.min(100, pos))
  }
  if (threshold_min !== null) {
    return value >= threshold_min ? 75 : 25
  }
  if (threshold_max !== null) {
    return value <= threshold_max ? 75 : 25
  }
  return 50
}

export default function SignalGauge({ signal, compact = false }: Props): ReactElement {
  const cfg      = STATUS_CONFIG[signal.status] ?? STATUS_CONFIG.normal
  const position = getBarPosition(signal)

  if (compact) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}
      >
        <div
          style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: cfg.color,
            boxShadow: `0 0 6px ${cfg.color}`,
            flexShrink: 0,
          }}
        />
        <span style={{ fontSize: 11, color: 'var(--text-secondary)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {signal.name}
        </span>
        <span style={{ fontSize: 10, color: cfg.color, fontFamily: 'Rajdhani', fontWeight: 700 }}>
          {signal.value ?? '—'}
        </span>
      </div>
    )
  }

  return (
    <div
      style={{
        background: 'var(--bg-elevated)',
        border: `1px solid ${cfg.color}30`,
        borderRadius: 8,
        padding: '12px 14px',
        marginBottom: 8,
      }}
    >
      {/* Top row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 10,
        }}
      >
        <span style={{ fontSize: 12, color: 'var(--text-primary)', fontWeight: 500, flex: 1, marginRight: 8 }}>
          {signal.name}
        </span>
        <span
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            fontSize: 9,
            color: cfg.color,
            fontFamily: 'Rajdhani',
            fontWeight: 700,
            letterSpacing: '0.12em',
            padding: '2px 6px',
            border: `1px solid ${cfg.color}40`,
            borderRadius: 3,
          }}
        >
          {cfg.icon} {cfg.label}
        </span>
      </div>

      {/* Value display */}
      <div
        style={{
          fontSize: 24,
          fontFamily: 'Rajdhani',
          fontWeight: 700,
          color: cfg.color,
          lineHeight: 1,
          marginBottom: 10,
        }}
      >
        {signal.value ?? '—'}
      </div>

      {/* Threshold bar */}
      <div style={{ position: 'relative' }}>
        {/* Track */}
        <div
          style={{
            height: 6,
            background: 'var(--border)',
            borderRadius: 3,
            overflow: 'visible',
            position: 'relative',
          }}
        >
          {/* Safe zone fill */}
          {signal.threshold_min !== null && signal.threshold_max !== null && (
            <div
              style={{
                position: 'absolute',
                left: '20%',
                right: '20%',
                top: 0,
                bottom: 0,
                background: `${cfg.color}20`,
                borderRadius: 3,
              }}
            />
          )}

          {/* Value marker */}
          <div
            style={{
              position: 'absolute',
              left: `${position}%`,
              top: '50%',
              transform: 'translate(-50%, -50%)',
              width: 12,
              height: 12,
              borderRadius: '50%',
              background: cfg.color,
              boxShadow: `0 0 8px ${cfg.color}`,
              border: '2px solid var(--bg-elevated)',
              transition: 'left 0.4s ease',
              zIndex: 2,
            }}
          />
        </div>

        {/* Threshold labels */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: 6,
            fontSize: 9,
            color: 'var(--text-muted)',
            fontFamily: 'Rajdhani',
            fontWeight: 600,
          }}
        >
          <span>{signal.threshold_min !== null ? `MIN ${signal.threshold_min}` : ''}</span>
          <span>{signal.threshold_max !== null ? `MAX ${signal.threshold_max}` : ''}</span>
        </div>
      </div>
    </div>
  )
}