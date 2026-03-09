import type { ReactElement } from 'react'

interface Props {
  label: string
  value: number | string
  sub?: string
  color?: string
  trend?: 'up' | 'down' | 'flat'
  trendValue?: string
}

export default function MetricTile({
  label,
  value,
  sub,
  color = 'var(--cyan)',
  trend,
  trendValue,
}: Props): ReactElement {
  const trendColor =
    trend === 'up'   ? 'var(--success)' :
    trend === 'down' ? 'var(--danger)'  :
    'var(--text-muted)'

  const trendIcon =
    trend === 'up'   ? '▲' :
    trend === 'down' ? '▼' :
    '●'

  return (
    <div
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: 8,
        padding: '14px 16px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Glow accent */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 2,
          background: color,
          opacity: 0.6,
        }}
      />

      <div
        style={{
          fontSize: 9,
          fontFamily: 'Rajdhani',
          fontWeight: 700,
          letterSpacing: '0.18em',
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
          marginBottom: 8,
        }}
      >
        {label}
      </div>

      <div
        style={{
          fontSize: 28,
          fontFamily: 'Rajdhani',
          fontWeight: 700,
          color,
          lineHeight: 1,
          marginBottom: 4,
        }}
      >
        {value}
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {sub && (
          <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>
            {sub}
          </div>
        )}
        {trend && trendValue && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 3,
              fontSize: 10,
              color: trendColor,
              fontFamily: 'Rajdhani',
              fontWeight: 700,
            }}
          >
            <span style={{ fontSize: 8 }}>{trendIcon}</span>
            {trendValue}
          </div>
        )}
      </div>
    </div>
  )
}