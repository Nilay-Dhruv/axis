import { useLocation } from 'react-router-dom'

const PAGE_DAYS: Record<string, { day: number; desc: string }> = {
  '/departments': { day: 7,  desc: 'Department management and overview' },
  '/activities':  { day: 9,  desc: 'Activity tracking and execution' },
  '/outcomes':    { day: 11, desc: 'Outcome and signal monitoring' },
  '/signals':     { day: 11, desc: 'Signal threshold tracking' },
  '/analytics':   { day: 22, desc: 'Analytics and trend visualization' },
  '/automations': { day: 16, desc: 'Automation engine and builder' },
  '/decisions':   { day: 20, desc: 'Decision logging and memory' },
  '/simulations': { day: 24, desc: 'Premium simulation engine' },
  '/roles':       { day: 13, desc: 'Role and permission management' },
  '/settings':    { day: 27, desc: 'Organization and user settings' },
}

export default function ComingSoon() {
  const location = useLocation()
  const info = PAGE_DAYS[location.pathname]

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
      }}
    >
      <div style={{ textAlign: 'center', maxWidth: 400 }}>
        {/* Icon */}
        <div
          style={{
            width: 72,
            height: 72,
            margin: '0 auto 24px',
            background: 'var(--cyan-glow)',
            border: '1px solid var(--border-bright)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 32,
          }}
        >
          ◈
        </div>

        <div
          style={{
            fontFamily: 'Rajdhani',
            fontWeight: 700,
            fontSize: 22,
            letterSpacing: '0.1em',
            color: 'var(--text-primary)',
            textTransform: 'uppercase',
            marginBottom: 8,
          }}
        >
          Coming Day {info?.day ?? '—'}
        </div>

        <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 20 }}>
          {info?.desc ?? 'This section is under construction.'}
        </div>

        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '4px 12px',
            border: '1px solid var(--border)',
            borderRadius: 4,
            fontSize: 10,
            color: 'var(--text-muted)',
            letterSpacing: '0.15em',
            fontFamily: 'Rajdhani',
            fontWeight: 600,
          }}
        >
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--warning)', display: 'inline-block' }} />
          IN DEVELOPMENT
        </div>
      </div>
    </div>
  )
}