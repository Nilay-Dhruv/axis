import type { ReactElement, ReactNode } from 'react'

interface Props {
  title: string
  subtitle?: string
  children: ReactNode
  accent?: string
  height?: number
  topRight?: ReactNode
}

export default function ChartCard({
  title,
  subtitle,
  children,
  accent = 'var(--cyan)',
  height = 240,
  topRight,
}: Props): ReactElement {
  return (
    <div
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderTop: `2px solid ${accent}`,
        borderRadius: 10,
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '14px 18px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 12,
        }}
      >
        <div>
          <div
            style={{
              fontFamily: 'Rajdhani',
              fontWeight: 700,
              fontSize: 13,
              letterSpacing: '0.08em',
              color: 'var(--text-primary)',
              textTransform: 'uppercase',
              marginBottom: subtitle ? 2 : 0,
            }}
          >
            {title}
          </div>
          {subtitle && (
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              {subtitle}
            </div>
          )}
        </div>
        {topRight && (
          <div style={{ flexShrink: 0 }}>{topRight}</div>
        )}
      </div>

      {/* Chart area */}
      <div style={{ padding: '16px 12px 8px', height }}>
        {children}
      </div>
    </div>
  )
}