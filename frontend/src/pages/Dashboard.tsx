import { useAuth } from '../hooks/useAuth'
import type { ReactElement } from 'react'

// ── Types ──────────────────────────────────────────────────────────────────

interface StatItem {
  label: string
  value: string
  delta: string
  icon: string
  color: string
}

interface QuickAction {
  label: string
  icon: string
  path: string
}

interface BuildItem {
  label: string
  day: number
  done: boolean
}

interface TimelineItem {
  icon: string
  text: string
  time: string
  color: string
  done: boolean
}

// ── Data ───────────────────────────────────────────────────────────────────

const STATS: StatItem[] = [
  { label: 'Active Departments', value: '6',  delta: '+0', icon: '◈', color: 'var(--cyan)'    },
  { label: 'Open Activities',    value: '—',  delta: '—',  icon: '◎', color: 'var(--warning)' },
  { label: 'Signal Alerts',      value: '—',  delta: '—',  icon: '▲', color: 'var(--danger)'  },
  { label: 'Automations',        value: '—',  delta: '—',  icon: '⬟', color: 'var(--success)' },
]

const QUICK_ACTIONS: QuickAction[] = [
  { label: 'View Departments', icon: '◈', path: '/departments' },
  { label: 'Log Decision',     icon: '◐', path: '/decisions'   },
  { label: 'Check Signals',    icon: '▲', path: '/signals'     },
]

const BUILD_PROGRESS: BuildItem[] = [
  { label: 'Auth System',   day: 3,  done: true  },
  { label: 'Layout & Nav',  day: 4,  done: true  },
  { label: 'Departments',   day: 7,  done: false },
  { label: 'Activities',    day: 9,  done: false },
  { label: 'Outcomes',      day: 11, done: false },
  { label: 'Automations',   day: 16, done: false },
  { label: 'Analytics',     day: 22, done: false },
  { label: 'Simulations',   day: 24, done: false },
]

const TIMELINE: TimelineItem[] = [
  { icon: '◆', text: 'Auth system initialized',   time: 'Day 3',            color: 'var(--success)',    done: true  },
  { icon: '◈', text: 'Layout & navigation built', time: 'Day 4',            color: 'var(--cyan)',       done: true  },
  { icon: '◇', text: 'Department backend',         time: 'Day 5 · upcoming', color: 'var(--text-muted)', done: false },
  { icon: '◇', text: 'Department frontend',        time: 'Day 7 · upcoming', color: 'var(--text-muted)', done: false },
  { icon: '◇', text: 'Activities & execution',     time: 'Day 9 · upcoming', color: 'var(--text-muted)', done: false },
]

// ── Sub-components ─────────────────────────────────────────────────────────

function StatCard({ stat, index }: { stat: StatItem; index: number }): ReactElement {
  return (
    <div
      key={stat.label}
      className="animate-fade-slide hover:border-border-bright"
      style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: 8,
        padding: '18px 20px',
        position: 'relative',
        overflow: 'hidden',
        transition: 'border-color 0.2s',
        animationDelay: `${index * 0.05}s`,
        cursor: 'default',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: -20,
          right: -20,
          width: 80,
          height: 80,
          borderRadius: '50%',
          background: stat.color,
          opacity: 0.04,
          filter: 'blur(20px)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: 12,
        }}
      >
        <span style={{ fontSize: 20, color: stat.color }}>{stat.icon}</span>
        <span
          style={{
            fontSize: 10,
            color: stat.delta === '—' ? 'var(--text-muted)' : 'var(--success)',
            fontFamily: 'Rajdhani',
            fontWeight: 600,
            letterSpacing: '0.05em',
            padding: '2px 6px',
            border: `1px solid ${stat.delta === '—' ? 'var(--border)' : 'rgba(0,204,136,0.3)'}`,
            borderRadius: 3,
          }}
        >
          {stat.delta}
        </span>
      </div>
      <div
        style={{
          fontSize: 28,
          fontFamily: 'Rajdhani',
          fontWeight: 700,
          color: 'var(--text-primary)',
          lineHeight: 1,
          marginBottom: 4,
        }}
      >
        {stat.value}
      </div>
      <div style={{ fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
        {stat.label}
      </div>
    </div>
  )
}

function TimelineRow({ item, isLast }: { item: TimelineItem; isLast: boolean }): ReactElement {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 12,
        padding: '10px 0',
        borderBottom: isLast ? 'none' : '1px solid var(--border)',
        opacity: item.done ? 1 : 0.45,
      }}
    >
      <div
        style={{
          width: 28,
          height: 28,
          borderRadius: 6,
          background: item.done ? `${item.color}15` : 'transparent',
          border: `1px solid ${item.done ? item.color : 'var(--border)'}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 12,
          color: item.color,
          flexShrink: 0,
          marginTop: 1,
        }}
      >
        {item.icon}
      </div>
      <div style={{ flex: 1 }}>
        <div
          style={{
            fontSize: 13,
            color: item.done ? 'var(--text-primary)' : 'var(--text-muted)',
            fontWeight: 500,
          }}
        >
          {item.text}
        </div>
        <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2, letterSpacing: '0.05em' }}>
          {item.time}
        </div>
      </div>
      {item.done && (
        <span
          style={{
            fontSize: 9,
            color: 'var(--success)',
            fontFamily: 'Rajdhani',
            fontWeight: 700,
            letterSpacing: '0.1em',
            padding: '2px 6px',
            border: '1px solid rgba(0,204,136,0.3)',
            borderRadius: 3,
            marginTop: 4,
            flexShrink: 0,
          }}
        >
          DONE
        </span>
      )}
    </div>
  )
}

function ActionLink({ action }: { action: QuickAction }): ReactElement {
  return (
    <a
      href={action.path}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '8px 10px',
        borderRadius: 6,
        color: 'var(--text-secondary)',
        fontSize: 13,
        textDecoration: 'none',
        transition: 'all 0.15s',
        marginBottom: 2,
      }}
      className="hover:bg-hover hover:text-primary"
    >
      <span style={{ color: 'var(--text-muted)', fontSize: 14 }}>{action.icon}</span>
      <span style={{ flex: 1 }}>{action.label}</span>
      <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>&#8594;</span>
    </a>
  )
}

function BuildRow({ item }: { item: BuildItem }): ReactElement {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '6px 0',
        borderBottom: '1px solid var(--border)',
        fontSize: 12,
      }}
    >
      <span
        style={{
          fontSize: 11,
          color: item.done ? 'var(--success)' : 'var(--text-muted)',
          flexShrink: 0,
        }}
      >
        {item.done ? '◆' : '◇'}
      </span>
      <span
        style={{
          flex: 1,
          color: item.done ? 'var(--text-primary)' : 'var(--text-muted)',
          fontWeight: item.done ? 500 : 400,
        }}
      >
        {item.label}
      </span>
      <span
        style={{
          fontSize: 9,
          color: item.done ? 'var(--success)' : 'var(--text-muted)',
          fontFamily: 'Rajdhani',
          fontWeight: 600,
          letterSpacing: '0.1em',
          flexShrink: 0,
        }}
      >
        D{item.day}
      </span>
    </div>
  )
}

// ── Main Component ─────────────────────────────────────────────────────────

export default function Dashboard(): ReactElement {
  const { user } = useAuth()
  const doneCount = BUILD_PROGRESS.filter((b) => b.done).length
  const progressPct = (doneCount / BUILD_PROGRESS.length) * 100
  const tier = user?.subscription_tier ?? 'free'

  return (
    <div className="animate-fade-slide">

      {/* ── Welcome Banner ─────────────────────────────── */}
      <div
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderLeft: '3px solid var(--cyan)',
          borderRadius: 8,
          padding: '20px 24px',
          marginBottom: 24,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div>
          <div
            style={{
              fontFamily: 'Rajdhani',
              fontWeight: 700,
              fontSize: 22,
              letterSpacing: '0.06em',
              color: 'var(--text-primary)',
              textTransform: 'uppercase',
            }}
          >
            Welcome back, {user?.full_name?.split(' ')[0]}
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>
            Your AXIS command center is operational. All systems nominal.
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 14px',
            background: 'rgba(0, 204, 136, 0.08)',
            border: '1px solid rgba(0, 204, 136, 0.3)',
            borderRadius: 4,
            fontSize: 11,
            color: 'var(--success)',
            fontFamily: 'Rajdhani',
            fontWeight: 600,
            letterSpacing: '0.1em',
          }}
        >
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              background: 'var(--success)',
              boxShadow: '0 0 8px var(--success)',
              display: 'inline-block',
            }}
          />
          ALL SYSTEMS OPERATIONAL
        </div>
      </div>

      {/* ── Stats Grid ─────────────────────────────────── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 16,
          marginBottom: 24,
        }}
      >
        {STATS.map((stat, i) => (
          <StatCard key={stat.label} stat={stat} index={i} />
        ))}
      </div>

      {/* ── Main Content Grid ──────────────────────────── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) 300px',
          gap: 16,
        }}
      >

        {/* ── Left: Activity Timeline ── */}
        <div
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            borderRadius: 8,
            padding: '20px 24px',
            minHeight: 320,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 20,
              paddingBottom: 14,
              borderBottom: '1px solid var(--border)',
            }}
          >
            <span
              style={{
                fontFamily: 'Rajdhani',
                fontWeight: 700,
                fontSize: 13,
                letterSpacing: '0.15em',
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
              }}
            >
              Recent Activity
            </span>
            <span
              style={{
                fontSize: 10,
                color: 'var(--border-bright)',
                padding: '2px 8px',
                border: '1px solid var(--border)',
                borderRadius: 3,
                fontFamily: 'Rajdhani',
                fontWeight: 600,
                letterSpacing: '0.1em',
              }}
            >
              LIVE &#183; DAY 14
            </span>
          </div>

          {TIMELINE.map((item, i) => (
            <TimelineRow
              key={item.text}
              item={item}
              isLast={i === TIMELINE.length - 1}
            />
          ))}
        </div>

        {/* ── Right Column ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Quick Actions */}
          <div
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              borderRadius: 8,
              padding: '16px 18px',
            }}
          >
            <div
              style={{
                fontFamily: 'Rajdhani',
                fontWeight: 700,
                fontSize: 12,
                letterSpacing: '0.15em',
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                marginBottom: 12,
                paddingBottom: 10,
                borderBottom: '1px solid var(--border)',
              }}
            >
              Quick Actions
            </div>
            {QUICK_ACTIONS.map((action) => (
              <ActionLink key={action.label} action={action} />
            ))}
          </div>

          {/* Build Progress */}
          <div
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              borderRadius: 8,
              padding: '16px 18px',
              flex: 1,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 12,
                paddingBottom: 10,
                borderBottom: '1px solid var(--border)',
              }}
            >
              <span
                style={{
                  fontFamily: 'Rajdhani',
                  fontWeight: 700,
                  fontSize: 12,
                  letterSpacing: '0.15em',
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                }}
              >
                Build Progress
              </span>
              <span
                style={{
                  fontSize: 10,
                  color: 'var(--cyan)',
                  fontFamily: 'Rajdhani',
                  fontWeight: 700,
                }}
              >
                {doneCount} / {BUILD_PROGRESS.length}
              </span>
            </div>

            {/* Progress bar */}
            <div
              style={{
                height: 3,
                background: 'var(--border)',
                borderRadius: 2,
                marginBottom: 14,
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${progressPct}%`,
                  background: 'var(--cyan)',
                  boxShadow: '0 0 8px var(--cyan)',
                  borderRadius: 2,
                  transition: 'width 0.6s ease',
                }}
              />
            </div>

            {BUILD_PROGRESS.map((item) => (
              <BuildRow key={item.label} item={item} />
            ))}
          </div>

          {/* Tier Badge */}
          <div
            style={{
              background: tier === 'premium' ? 'rgba(0,212,255,0.05)' : 'var(--bg-surface)',
              border: `1px solid ${tier === 'premium' ? 'var(--cyan)' : 'var(--border)'}`,
              borderRadius: 8,
              padding: '14px 18px',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                background: 'var(--cyan-glow)',
                border: '1px solid var(--border-bright)',
                borderRadius: 6,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 18,
                color: 'var(--cyan)',
                flexShrink: 0,
              }}
            >
              ◆
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 500,
                  color: 'var(--text-primary)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  fontFamily: 'Rajdhani',
                }}
              >
                {tier === 'free' ? 'Free Tier' : tier === 'basic_premium' ? 'Basic Premium' : 'Premium'}
              </div>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 1 }}>
                {tier === 'free'
                  ? 'Upgrade to unlock automations & simulations'
                  : 'All features unlocked'}
              </div>
            </div>

            {tier === 'free' && (
              <a
                href="/settings"
                style={{
                  fontSize: 10,
                  color: 'var(--cyan)',
                  fontFamily: 'Rajdhani',
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  padding: '4px 8px',
                  border: '1px solid var(--cyan)',
                  borderRadius: 4,
                  textDecoration: 'none',
                  flexShrink: 0,
                  transition: 'background 0.15s',
                }}
              >
                UPGRADE
              </a>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}