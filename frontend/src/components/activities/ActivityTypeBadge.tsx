import type { ReactElement } from 'react'

interface Props {
  type: string
  size?: 'sm' | 'md'
}

const TYPE_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
  track:    { label: 'TRACK',    color: 'var(--cyan)',    icon: '◎' },
  approve:  { label: 'APPROVE',  color: 'var(--success)', icon: '◆' },
  review:   { label: 'REVIEW',   color: 'var(--warning)', icon: '◈' },
  execute:  { label: 'EXECUTE',  color: '#8866ff',        icon: '▶' },
  report:   { label: 'REPORT',   color: '#ff6644',        icon: '◉' },
  monitor:  { label: 'MONITOR',  color: '#ff4488',        icon: '▲' },
  alert:    { label: 'ALERT',    color: 'var(--danger)',  icon: '⚠' },
  schedule: { label: 'SCHEDULE', color: '#44aaff',        icon: '◷' },
}

export default function ActivityTypeBadge({ type, size = 'sm' }: Props): ReactElement {
  const cfg = TYPE_CONFIG[type] ?? { label: type.toUpperCase(), color: 'var(--text-muted)', icon: '◇' }

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: size === 'md' ? 5 : 4,
        padding: size === 'md' ? '3px 8px' : '2px 6px',
        background: `${cfg.color}15`,
        border: `1px solid ${cfg.color}40`,
        borderRadius: 4,
        fontSize: size === 'md' ? 10 : 9,
        color: cfg.color,
        fontFamily: 'Rajdhani',
        fontWeight: 700,
        letterSpacing: '0.12em',
        whiteSpace: 'nowrap',
      }}
    >
      <span style={{ fontSize: size === 'md' ? 10 : 9 }}>{cfg.icon}</span>
      {cfg.label}
    </span>
  )
}