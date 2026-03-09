import type { ReactElement } from 'react'
import type { Department } from '../../types/department'

interface Props {
  department: Department
  onClick: (id: string) => void
  isSelected: boolean
}

const TYPE_LABELS: Record<string, string> = {
  leadership:  'Leadership',
  finance:     'Finance',
  sales:       'Sales',
  marketing:   'Marketing',
  operations:  'Operations',
  hr:          'Human Resources',
  product:     'Product',
  engineering: 'Engineering',
  legal:       'Legal',
  custom:      'Custom',
}

export default function DepartmentCard({
  department,
  onClick,
  isSelected,
}: Props): ReactElement {
  const icon   = department.config?.icon  ?? '◈'
  const color  = department.config?.color ?? 'var(--cyan)'
  const desc   = department.config?.description ?? 'No description provided'

  return (
    <button
      onClick={() => onClick(department.id)}
      style={{
        width: '100%',
        textAlign: 'left',
        background: isSelected ? `${color}08` : 'var(--bg-surface)',
        border: `1px solid ${isSelected ? color : 'var(--border)'}`,
        borderRadius: 10,
        padding: '20px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        position: 'relative',
        overflow: 'hidden',
      }}
      className="group"
    >
      {/* Top glow on hover */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 2,
          background: color,
          opacity: isSelected ? 1 : 0,
          transition: 'opacity 0.2s',
        }}
        className="group-hover:opacity-100"
      />

      {/* Icon + badge row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: 14,
        }}
      >
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 8,
            background: `${color}15`,
            border: `1px solid ${color}40`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 22,
            color: color,
            flexShrink: 0,
          }}
        >
          {icon}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
          {department.is_default && (
            <span
              style={{
                fontSize: 9,
                color: 'var(--text-muted)',
                fontFamily: 'Rajdhani',
                fontWeight: 600,
                letterSpacing: '0.15em',
                padding: '2px 6px',
                border: '1px solid var(--border)',
                borderRadius: 3,
              }}
            >
              DEFAULT
            </span>
          )}
          {department.is_custom && (
            <span
              style={{
                fontSize: 9,
                color: 'var(--cyan)',
                fontFamily: 'Rajdhani',
                fontWeight: 600,
                letterSpacing: '0.15em',
                padding: '2px 6px',
                border: '1px solid var(--cyan)',
                borderRadius: 3,
              }}
            >
              CUSTOM
            </span>
          )}
        </div>
      </div>

      {/* Name */}
      <div
        style={{
          fontFamily: 'Rajdhani',
          fontWeight: 700,
          fontSize: 17,
          letterSpacing: '0.04em',
          color: 'var(--text-primary)',
          marginBottom: 4,
          textTransform: 'uppercase',
        }}
      >
        {department.name}
      </div>

      {/* Type label */}
      <div
        style={{
          fontSize: 10,
          color: color,
          fontFamily: 'Rajdhani',
          fontWeight: 600,
          letterSpacing: '0.12em',
          marginBottom: 10,
        }}
      >
        {TYPE_LABELS[department.type] ?? department.type.toUpperCase()}
      </div>

      {/* Description */}
      <div
        style={{
          fontSize: 12,
          color: 'var(--text-muted)',
          lineHeight: 1.5,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          marginBottom: 14,
        }}
      >
        {desc}
      </div>

      {/* Footer */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: 12,
          borderTop: '1px solid var(--border)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
            <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>0</span>
            {' '}activities
          </span>
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
            <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>0</span>
            {' '}outcomes
          </span>
        </div>

        <span
          style={{
            fontSize: 11,
            color: isSelected ? color : 'var(--text-muted)',
            fontFamily: 'Rajdhani',
            fontWeight: 600,
            letterSpacing: '0.08em',
            transition: 'color 0.2s',
          }}
          className="group-hover:text-cyan"
        >
          VIEW &#8594;
        </span>
      </div>
    </button>
  )
}