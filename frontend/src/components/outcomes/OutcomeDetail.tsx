import type { ReactElement } from 'react'
import type { OutcomeWithSignals } from '../../types/department'
import SignalGauge from './SignalGauge'

interface Props {
  detail: OutcomeWithSignals
  deptColor: string
  progress: number
  onClose: () => void
  loading: boolean
}

const STATUS_CONFIG: Record<string, { color: string; label: string }> = {
  active:   { color: 'var(--cyan)',       label: 'ACTIVE'   },
  achieved: { color: 'var(--success)',    label: 'ACHIEVED' },
  at_risk:  { color: 'var(--danger)',     label: 'AT RISK'  },
  inactive: { color: 'var(--text-muted)', label: 'INACTIVE' },
}

export default function OutcomeDetail({
  detail,
  deptColor,
  progress,
  onClose,
  loading,
}: Props): ReactElement {
  const { outcome, signals } = detail
  const cfg = STATUS_CONFIG[outcome.status] ?? STATUS_CONFIG.active

  if (loading) {
    return (
      <div
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: 10,
          padding: 24,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 200,
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              width: 28,
              height: 28,
              border: '2px solid var(--border)',
              borderTop: `2px solid ${deptColor}`,
              borderRadius: '50%',
              margin: '0 auto 10px',
              animation: 'spin 0.8s linear infinite',
            }}
          />
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Loading...</div>
        </div>
      </div>
    )
  }

  const criticalSignals = signals.filter((s) => s.status === 'critical')
  const warningSignals  = signals.filter((s) => s.status === 'warning')

  return (
    <div
      style={{
        background: 'var(--bg-surface)',
        border: `1px solid ${deptColor}40`,
        borderTop: `2px solid ${deptColor}`,
        borderRadius: 10,
        overflow: 'hidden',
        animation: 'fadeSlideIn 0.25s ease',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '18px 20px',
          borderBottom: '1px solid var(--border)',
          background: `${deptColor}06`,
          display: 'flex',
          alignItems: 'flex-start',
          gap: 12,
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 9,
              color: 'var(--text-muted)',
              fontFamily: 'Rajdhani',
              fontWeight: 700,
              letterSpacing: '0.2em',
              marginBottom: 4,
            }}
          >
            OUTCOME DETAIL
          </div>
          <div
            style={{
              fontFamily: 'Rajdhani',
              fontWeight: 700,
              fontSize: 16,
              letterSpacing: '0.04em',
              color: 'var(--text-primary)',
              textTransform: 'uppercase',
              marginBottom: 6,
            }}
          >
            {outcome.name}
          </div>
          <span
            style={{
              fontSize: 9,
              color: cfg.color,
              fontFamily: 'Rajdhani',
              fontWeight: 700,
              letterSpacing: '0.12em',
              padding: '2px 6px',
              border: `1px solid ${cfg.color}40`,
              borderRadius: 3,
              background: `${cfg.color}10`,
            }}
          >
            {cfg.label}
          </span>
        </div>
        <button
          onClick={onClose}
          style={{
            width: 26,
            height: 26,
            border: '1px solid var(--border)',
            background: 'transparent',
            borderRadius: 5,
            color: 'var(--text-muted)',
            cursor: 'pointer',
            fontSize: 11,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          ✕
        </button>
      </div>

      {/* Progress section */}
      <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            marginBottom: 10,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 28,
                fontFamily: 'Rajdhani',
                fontWeight: 700,
                color: deptColor,
                lineHeight: 1,
              }}
            >
              {outcome.current_value ?? '—'}
              {outcome.unit && (
                <span style={{ fontSize: 14, marginLeft: 4, color: 'var(--text-muted)' }}>
                  {outcome.unit}
                </span>
              )}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
              Target: {outcome.target_value ?? '—'} {outcome.unit}
            </div>
          </div>
          <div
            style={{
              fontSize: 36,
              fontFamily: 'Rajdhani',
              fontWeight: 700,
              color: deptColor,
              lineHeight: 1,
            }}
          >
            {outcome.target_value ? `${Math.round(progress)}%` : '—'}
          </div>
        </div>

        <div
          style={{
            height: 8,
            background: 'var(--border)',
            borderRadius: 4,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${progress}%`,
              background: deptColor,
              borderRadius: 4,
              transition: 'width 0.6s ease',
              boxShadow: `0 0 10px ${deptColor}`,
            }}
          />
        </div>
      </div>

      {/* Alert strip */}
      {(criticalSignals.length > 0 || warningSignals.length > 0) && (
        <div
          style={{
            padding: '10px 20px',
            background:
              criticalSignals.length > 0
                ? 'rgba(255,68,85,0.08)'
                : 'rgba(255,170,0,0.08)',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontSize: 11,
            color: criticalSignals.length > 0 ? 'var(--danger)' : 'var(--warning)',
          }}
        >
          <span>⚠</span>
          {criticalSignals.length > 0
            ? `${criticalSignals.length} critical signal${criticalSignals.length > 1 ? 's' : ''} require attention`
            : `${warningSignals.length} signal${warningSignals.length > 1 ? 's' : ''} in warning state`}
        </div>
      )}

      {/* Signals */}
      <div style={{ padding: '14px 20px', maxHeight: 340, overflowY: 'auto' }}>
        <div
          style={{
            fontSize: 10,
            fontFamily: 'Rajdhani',
            fontWeight: 700,
            letterSpacing: '0.18em',
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            marginBottom: 12,
          }}
        >
          Signals ({signals.length})
        </div>

        {signals.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '20px 0',
              color: 'var(--text-muted)',
              fontSize: 12,
            }}
          >
            <div style={{ fontSize: 24, opacity: 0.2, marginBottom: 6 }}>▲</div>
            No signals configured
          </div>
        ) : (
          signals.map((signal) => (
            <SignalGauge key={signal.id} signal={signal} />
          ))
        )}
      </div>

      {/* Description */}
      {outcome.description && (
        <div
          style={{
            padding: '12px 20px',
            borderTop: '1px solid var(--border)',
            fontSize: 12,
            color: 'var(--text-muted)',
            lineHeight: 1.6,
          }}
        >
          {outcome.description}
        </div>
      )}
    </div>
  )
}