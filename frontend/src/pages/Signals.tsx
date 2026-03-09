import { type ReactElement } from 'react'
import { useOutcomes } from '../hooks/useOutcomes'
import SignalGauge from '../components/outcomes/SignalGauge'
import SkeletonCard from '../components/common/SkeletonCard'

const STATUS_CONFIG = {
  normal:   { color: 'var(--success)', label: 'NORMAL',   icon: '◆' },
  warning:  { color: 'var(--warning)', label: 'WARNING',  icon: '▲' },
  critical: { color: 'var(--danger)',  label: 'CRITICAL', icon: '⚠' },
}

export default function Signals(): ReactElement {
  const { list, alerts, summary, loading, getDeptName, getDeptColor } = useOutcomes(true)

  // Collect all signals from all outcomes that have been loaded with detail
  const allAlerts = alerts

  const criticalCount = allAlerts.filter((s) => s.status === 'critical').length
  const warningCount  = allAlerts.filter((s) => s.status === 'warning').length

  return (
    <div className="animate-fade-slide">

      {/* ── Page Header ──────────────────────────────────── */}
      <div style={{ marginBottom: 24 }}>
        <div
          style={{
            fontSize: 11,
            fontFamily: 'Rajdhani',
            fontWeight: 700,
            letterSpacing: '0.2em',
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            marginBottom: 4,
          }}
        >
          Signal Intelligence
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
          Real-time threshold monitoring across all outcomes
        </div>
      </div>

      {/* ── Signal Stats ─────────────────────────────────── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 10,
          marginBottom: 24,
        }}
      >
        {[
          { label: 'Total Signals',  value: summary?.total_signals ?? 0,    color: 'var(--cyan)'    },
          { label: 'Normal',         value: summary?.normal_signals ?? 0,    color: 'var(--success)' },
          { label: 'Warning',        value: summary?.warning_signals ?? 0,   color: 'var(--warning)' },
          { label: 'Critical',       value: summary?.critical_signals ?? 0,  color: 'var(--danger)'  },
        ].map((s) => (
          <div
            key={s.label}
            style={{
              background: 'var(--bg-surface)',
              border: `1px solid ${s.value > 0 && s.label !== 'Total Signals' && s.label !== 'Normal' ? `${s.color}30` : 'var(--border)'}`,
              borderRadius: 8,
              padding: '14px 16px',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                fontSize: 28,
                fontFamily: 'Rajdhani',
                fontWeight: 700,
                color: s.color,
                lineHeight: 1,
                marginBottom: 4,
              }}
            >
              {s.value}
            </div>
            <div
              style={{
                fontSize: 9,
                color: 'var(--text-muted)',
                fontFamily: 'Rajdhani',
                fontWeight: 600,
                letterSpacing: '0.1em',
              }}
            >
              {s.label.toUpperCase()}
            </div>
          </div>
        ))}
      </div>

      {/* ── Alerts Panel + All Signals ───────────────────── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 20,
          alignItems: 'start',
        }}
      >

        {/* Critical & Warning alerts */}
        <div>
          <div
            style={{
              fontFamily: 'Rajdhani',
              fontWeight: 700,
              fontSize: 11,
              letterSpacing: '0.18em',
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              marginBottom: 12,
            }}
          >
            Active Alerts ({allAlerts.length})
          </div>

          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : allAlerts.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '40px 24px',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                borderRadius: 10,
              }}
            >
              <div
                style={{
                  fontSize: 36,
                  marginBottom: 10,
                  color: 'var(--success)',
                  opacity: 0.6,
                }}
              >
                ◆
              </div>
              <div
                style={{
                  fontFamily: 'Rajdhani',
                  fontWeight: 700,
                  fontSize: 15,
                  color: 'var(--text-primary)',
                  textTransform: 'uppercase',
                  marginBottom: 6,
                }}
              >
                All Systems Normal
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                No signals in warning or critical state.
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {/* Critical first */}
              {allAlerts
                .filter((s) => s.status === 'critical')
                .map((signal) => (
                  <div
                    key={signal.id}
                    style={{
                      background: 'var(--bg-surface)',
                      border: '1px solid rgba(255,68,85,0.3)',
                      borderRadius: 8,
                      padding: '14px 16px',
                    }}
                  >
                    <SignalGauge signal={signal} />
                  </div>
                ))}

              {/* Warning second */}
              {allAlerts
                .filter((s) => s.status === 'warning')
                .map((signal) => (
                  <div
                    key={signal.id}
                    style={{
                      background: 'var(--bg-surface)',
                      border: '1px solid rgba(255,170,0,0.3)',
                      borderRadius: 8,
                      padding: '14px 16px',
                    }}
                  >
                    <SignalGauge signal={signal} />
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* Signal health overview */}
        <div>
          <div
            style={{
              fontFamily: 'Rajdhani',
              fontWeight: 700,
              fontSize: 11,
              letterSpacing: '0.18em',
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              marginBottom: 12,
            }}
          >
            Health Overview
          </div>

          {/* Status breakdown */}
          <div
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              borderRadius: 10,
              padding: '16px 18px',
              marginBottom: 16,
            }}
          >
            {Object.entries(STATUS_CONFIG).map(([status, cfg]) => {
              const count =
                status === 'critical' ? criticalCount :
                status === 'warning'  ? warningCount  :
                (summary?.normal_signals ?? 0)
              const total = summary?.total_signals ?? 1

              return (
                <div key={status} style={{ marginBottom: 14 }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: 6,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ color: cfg.color, fontSize: 11 }}>{cfg.icon}</span>
                      <span
                        style={{
                          fontSize: 11,
                          fontFamily: 'Rajdhani',
                          fontWeight: 700,
                          letterSpacing: '0.1em',
                          color: cfg.color,
                        }}
                      >
                        {cfg.label}
                      </span>
                    </div>
                    <span
                      style={{
                        fontSize: 16,
                        fontFamily: 'Rajdhani',
                        fontWeight: 700,
                        color: cfg.color,
                      }}
                    >
                      {count}
                    </span>
                  </div>
                  <div
                    style={{
                      height: 6,
                      background: 'var(--border)',
                      borderRadius: 3,
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: total > 0 ? `${(count / total) * 100}%` : '0%',
                        background: cfg.color,
                        borderRadius: 3,
                        transition: 'width 0.5s ease',
                      }}
                    />
                  </div>
                </div>
              )
            })}
          </div>

          {/* Outcome signal count breakdown */}
          <div
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              borderRadius: 10,
              padding: '16px 18px',
            }}
          >
            <div
              style={{
                fontFamily: 'Rajdhani',
                fontWeight: 700,
                fontSize: 10,
                letterSpacing: '0.15em',
                color: 'var(--text-muted)',
                marginBottom: 12,
                textTransform: 'uppercase',
              }}
            >
              By Outcome
            </div>
            {list.length === 0 ? (
              <div style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', padding: '16px 0' }}>
                Load outcomes to see signal breakdown
              </div>
            ) : (
              list.slice(0, 8).map((outcome) => {
                const deptColor = getDeptColor(outcome.department_id)
                return (
                  <div
                    key={outcome.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '6px 0',
                      borderBottom: '1px solid var(--border)',
                    }}
                  >
                    <div
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        background: deptColor,
                        flexShrink: 0,
                      }}
                    />
                    <span
                      style={{
                        fontSize: 11,
                        color: 'var(--text-secondary)',
                        flex: 1,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {outcome.name}
                    </span>
                    <span
                      style={{
                        fontSize: 10,
                        color: 'var(--text-muted)',
                        fontFamily: 'Rajdhani',
                        fontWeight: 600,
                      }}
                    >
                      {getDeptName(outcome.department_id)}
                    </span>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>
    </div>
  )
}