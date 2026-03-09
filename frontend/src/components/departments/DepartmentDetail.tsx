import type { ReactElement } from 'react'
import type { DepartmentDetail as DeptDetailType } from '../../types/department'

interface Props {
  detail: DeptDetailType
  onClose: () => void
  loading: boolean
}

export default function DepartmentDetail({ detail, onClose, loading }: Props): ReactElement {
  const { department, activities, outcomes } = detail
  const icon  = department.config?.icon  ?? '◈'
  const color = department.config?.color ?? 'var(--cyan)'
  const desc  = department.config?.description ?? ''

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
          minHeight: 300,
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              width: 32,
              height: 32,
              border: '2px solid var(--border)',
              borderTop: `2px solid ${color}`,
              borderRadius: '50%',
              margin: '0 auto 12px',
              animation: 'spin 0.8s linear infinite',
            }}
          />
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Loading department...</div>
        </div>
      </div>
    )
  }

  return (
    <div
      style={{
        background: 'var(--bg-surface)',
        border: `1px solid ${color}40`,
        borderTop: `2px solid ${color}`,
        borderRadius: 10,
        overflow: 'hidden',
        animation: 'fadeSlideIn 0.25s ease',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '20px 22px',
          borderBottom: '1px solid var(--border)',
          background: `${color}06`,
          display: 'flex',
          alignItems: 'flex-start',
          gap: 14,
        }}
      >
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 10,
            background: `${color}18`,
            border: `1px solid ${color}50`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 26,
            color: color,
            flexShrink: 0,
          }}
        >
          {icon}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontFamily: 'Rajdhani',
              fontWeight: 700,
              fontSize: 18,
              letterSpacing: '0.06em',
              color: 'var(--text-primary)',
              textTransform: 'uppercase',
            }}
          >
            {department.name}
          </div>
          <div style={{ fontSize: 11, color: color, fontFamily: 'Rajdhani', fontWeight: 600, letterSpacing: '0.12em', marginTop: 2 }}>
            {department.type.toUpperCase()}
          </div>
          {desc && (
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6, lineHeight: 1.5 }}>
              {desc}
            </div>
          )}
        </div>

        <button
          onClick={onClose}
          style={{
            width: 28,
            height: 28,
            border: '1px solid var(--border)',
            background: 'transparent',
            borderRadius: 6,
            color: 'var(--text-muted)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 12,
            flexShrink: 0,
            transition: 'all 0.15s',
          }}
        >
          ✕
        </button>
      </div>

      {/* Stats row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          borderBottom: '1px solid var(--border)',
        }}
      >
        {[
          { label: 'Activities', value: activities.length, icon: '◎' },
          { label: 'Outcomes',   value: outcomes.length,   icon: '◆' },
          { label: 'Signals',    value: 0,                 icon: '▲' },
        ].map((stat, i) => (
          <div
            key={stat.label}
            style={{
              padding: '14px 16px',
              borderRight: i < 2 ? '1px solid var(--border)' : 'none',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: 11, color: color, marginBottom: 4 }}>{stat.icon}</div>
            <div
              style={{
                fontSize: 22,
                fontFamily: 'Rajdhani',
                fontWeight: 700,
                color: 'var(--text-primary)',
                lineHeight: 1,
              }}
            >
              {stat.value}
            </div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Activities section */}
      <div style={{ padding: '16px 22px' }}>
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
          Activities
        </div>

        {activities.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '20px 0',
              color: 'var(--text-muted)',
              fontSize: 12,
            }}
          >
            <div style={{ fontSize: 24, marginBottom: 6, opacity: 0.3 }}>◎</div>
            No activities yet — coming Day 9
          </div>
        ) : (
          activities.slice(0, 4).map((activity) => (
            <div
              key={activity.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '8px 10px',
                borderRadius: 6,
                marginBottom: 4,
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border)',
              }}
            >
              <span style={{ fontSize: 12, color: color }}>◎</span>
              <span style={{ fontSize: 12, color: 'var(--text-primary)', flex: 1 }}>
                {activity.name}
              </span>
              <span
                style={{
                  fontSize: 9,
                  color: 'var(--text-muted)',
                  fontFamily: 'Rajdhani',
                  fontWeight: 600,
                  letterSpacing: '0.1em',
                  padding: '1px 5px',
                  border: '1px solid var(--border)',
                  borderRadius: 3,
                }}
              >
                {activity.type.toUpperCase()}
              </span>
            </div>
          ))
        )}
      </div>

      {/* Outcomes section */}
      <div
        style={{
          padding: '0 22px 16px',
          borderTop: '1px solid var(--border)',
          paddingTop: 16,
        }}
      >
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
          Outcomes
        </div>

        {outcomes.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '20px 0',
              color: 'var(--text-muted)',
              fontSize: 12,
            }}
          >
            <div style={{ fontSize: 24, marginBottom: 6, opacity: 0.3 }}>◆</div>
            No outcomes yet — coming Day 11
          </div>
        ) : (
          outcomes.map((outcome) => {
            const progress =
              outcome.target_value && outcome.current_value
                ? Math.min((outcome.current_value / outcome.target_value) * 100, 100)
                : 0

            const statusColor =
              outcome.status === 'achieved'  ? 'var(--success)' :
              outcome.status === 'at_risk'   ? 'var(--danger)'  :
              outcome.status === 'inactive'  ? 'var(--text-muted)' :
              color

            return (
              <div
                key={outcome.id}
                style={{
                  padding: '10px 12px',
                  borderRadius: 6,
                  marginBottom: 6,
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 6,
                  }}
                >
                  <span style={{ fontSize: 12, color: 'var(--text-primary)', fontWeight: 500 }}>
                    {outcome.name}
                  </span>
                  <span
                    style={{
                      fontSize: 9,
                      color: statusColor,
                      fontFamily: 'Rajdhani',
                      fontWeight: 600,
                      letterSpacing: '0.1em',
                    }}
                  >
                    {outcome.status.toUpperCase()}
                  </span>
                </div>
                {outcome.target_value !== null && (
                  <div>
                    <div
                      style={{
                        height: 3,
                        background: 'var(--border)',
                        borderRadius: 2,
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          height: '100%',
                          width: `${progress}%`,
                          background: statusColor,
                          borderRadius: 2,
                          transition: 'width 0.5s ease',
                        }}
                      />
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginTop: 4,
                        fontSize: 10,
                        color: 'var(--text-muted)',
                      }}
                    >
                      <span>{outcome.current_value ?? 0} {outcome.unit}</span>
                      <span>{outcome.target_value} {outcome.unit}</span>
                    </div>
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>

      {/* Footer action */}
      <div
        style={{
          padding: '12px 22px',
          borderTop: '1px solid var(--border)',
          display: 'flex',
          gap: 8,
        }}
      >
        <button
          style={{
            flex: 1,
            padding: '8px',
            background: `${color}15`,
            border: `1px solid ${color}50`,
            borderRadius: 6,
            color: color,
            fontSize: 11,
            fontFamily: 'Rajdhani',
            fontWeight: 700,
            letterSpacing: '0.12em',
            cursor: 'pointer',
            transition: 'all 0.15s',
          }}
        >
          OPEN FULL VIEW
        </button>
      </div>
    </div>
  )
}