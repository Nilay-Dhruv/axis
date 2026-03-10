import { useState, useEffect, type ReactElement } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import type { RootState } from '../store/store'
import dashboardService from '../services/dashboardService'
import type { DashboardSummary } from '../services/dashboardService'
import type { AxiosError } from 'axios'

// ─── Sub-components ───────────────────────────────────────────────────────────

interface StatCardProps {
  label:   string
  value:   string | number
  sub?:    string
  icon:    string
  accent?: string
  onClick?: () => void
}

function StatCard({ label, value, sub, icon, accent = 'var(--neu-accent)', onClick }: StatCardProps): ReactElement {
  return (
    <button
      onClick={onClick}
      style={{
        textAlign: 'left',
        background: 'var(--neu-bg)',
        borderRadius: 20,
        boxShadow: 'var(--neu-shadow-out)',
        padding: '22px 24px',
        border: 'none',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'box-shadow 0.2s ease',
        width: '100%',
      }}
      onMouseEnter={(e) => {
        if (onClick) (e.currentTarget as HTMLElement).style.boxShadow = 'var(--neu-shadow-in)'
      }}
      onMouseLeave={(e) => {
        if (onClick) (e.currentTarget as HTMLElement).style.boxShadow = 'var(--neu-shadow-out)'
      }}
    >
      {/* Icon row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div
          style={{
            width: 42, height: 42, borderRadius: 12,
            background: 'var(--neu-bg)',
            boxShadow: 'var(--neu-shadow-out)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18, color: accent,
          }}
        >
          {icon}
        </div>
        {onClick && (
          <span style={{ fontSize: 11, color: 'var(--neu-text-light)', fontFamily: 'Rajdhani', fontWeight: 700 }}>
            VIEW →
          </span>
        )}
      </div>

      {/* Value */}
      <div
        style={{
          fontFamily: 'Rajdhani',
          fontWeight: 800,
          fontSize: 36,
          color: 'var(--neu-text-dark)',
          lineHeight: 1,
          marginBottom: 6,
        }}
      >
        {value}
      </div>

      {/* Label */}
      <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--neu-text-mid)', letterSpacing: '0.04em' }}>
        {label}
      </div>

      {/* Sub */}
      {sub && (
        <div style={{ fontSize: 11, color: 'var(--neu-text-light)', marginTop: 4 }}>
          {sub}
        </div>
      )}
    </button>
  )
}

interface HealthBarProps {
  critical: number
  warning:  number
  normal:   number
  total:    number
}

function SignalHealthBar({ critical, warning, normal, total }: HealthBarProps): ReactElement {
  if (total === 0) return (
    <div style={{ height: 10, borderRadius: 5, background: 'var(--neu-bg)', boxShadow: 'var(--neu-shadow-in)' }} />
  )
  const cp = (critical / total) * 100
  const wp = (warning  / total) * 100
  const np = (normal   / total) * 100

  return (
    <div>
      <div
        style={{
          height: 10, borderRadius: 5, overflow: 'hidden',
          background: 'var(--neu-bg)', boxShadow: 'var(--neu-shadow-in)',
          display: 'flex',
        }}
      >
        {cp > 0 && <div style={{ width: `${cp}%`, background: '#b44646', transition: 'width 0.6s' }} />}
        {wp > 0 && <div style={{ width: `${wp}%`, background: '#c4a45a', transition: 'width 0.6s' }} />}
        {np > 0 && <div style={{ width: `${np}%`, background: '#468c64', transition: 'width 0.6s' }} />}
      </div>
      <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
        {[
          { label: 'Critical', count: critical, color: '#b44646' },
          { label: 'Warning',  count: warning,  color: '#c4a45a' },
          { label: 'Normal',   count: normal,   color: '#468c64' },
        ].map((item) => (
          <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: item.color, flexShrink: 0 }} />
            <span style={{ fontSize: 11, color: 'var(--neu-text-light)', fontFamily: 'Rajdhani', fontWeight: 600 }}>
              {item.count} {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

interface ActivityRowProps {
  name:        string
  status:      string
  executedAt:  string | null
}

function ActivityRow({ name, status, executedAt }: ActivityRowProps): ReactElement {
  const statusCfg: Record<string, { color: string; bg: string }> = {
    completed: { color: '#468c64', bg: 'rgba(70,140,100,0.10)' },
    failed:    { color: '#b44646', bg: 'rgba(180,70,70,0.10)'  },
    pending:   { color: '#c4a45a', bg: 'rgba(196,164,90,0.10)' },
  }
  const cfg = statusCfg[status] ?? { color: 'var(--neu-text-light)', bg: 'transparent' }

  const timeAgo = (iso: string | null): string => {
    if (!iso) return '—'
    const diff = Date.now() - new Date(iso).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h ago`
    return `${Math.floor(hrs / 24)}d ago`
  }

  return (
    <div
      style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '11px 0',
        borderBottom: '1px solid var(--neu-divider)',
      }}
    >
      <div
        style={{
          width: 8, height: 8, borderRadius: '50%',
          background: cfg.color, flexShrink: 0,
        }}
      />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 13, fontWeight: 600, color: 'var(--neu-text-dark)',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}
        >
          {name}
        </div>
      </div>
      <span
        style={{
          fontSize: 10, fontFamily: 'Rajdhani', fontWeight: 700,
          letterSpacing: '0.08em', padding: '3px 8px', borderRadius: 20,
          background: cfg.bg, color: cfg.color,
          flexShrink: 0,
        }}
      >
        {status.toUpperCase()}
      </span>
      <span style={{ fontSize: 11, color: 'var(--neu-text-light)', flexShrink: 0, minWidth: 52, textAlign: 'right' }}>
        {timeAgo(executedAt)}
      </span>
    </div>
  )
}

interface SkeletonCardProps { height?: number }

function SkeletonCard({ height = 120 }: SkeletonCardProps): ReactElement {
  return (
    <div
      style={{
        background: 'var(--neu-bg)',
        borderRadius: 20,
        boxShadow: 'var(--neu-shadow-out)',
        height,
        animation: 'pulse 1.4s ease-in-out infinite',
      }}
    />
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Dashboard(): ReactElement {
  const navigate = useNavigate()
  const user     = useSelector((s: RootState) => s.auth.user)

  const [summary, setSummary] = useState<DashboardSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState<string | null>(null)

  const greeting = (): string => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  }

  useEffect(() => {
    const load = async () => {
      try {
        const res = await dashboardService.getSummary()
        setSummary(res.data)
      } catch (err) {
        const e = err as AxiosError<{ error: { message: string } }>
        setError(e.response?.data?.error?.message ?? 'Failed to load dashboard')
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [])

  const firstName = user?.full_name?.split(' ')[0] ?? 'there'

  return (
    <div className="neu-fade-up">

      {/* ── Greeting ──────────────────────────────────────────────── */}
      <div style={{ marginBottom: 32 }}>
        <div
          style={{
            fontFamily: 'Rajdhani',
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.2em',
            color: 'var(--neu-text-light)',
            textTransform: 'uppercase',
            marginBottom: 4,
          }}
        >
          {greeting()}
        </div>
        <h1
          style={{
            fontSize: 28,
            fontWeight: 900,
            color: 'var(--neu-text-dark)',
            letterSpacing: '-0.3px',
            marginBottom: 6,
          }}
        >
          {firstName} ◈
        </h1>
        <div style={{ fontSize: 13, color: 'var(--neu-text-mid)' }}>
          Here's what's happening across your organization today.
        </div>
      </div>

      {/* ── Error ─────────────────────────────────────────────────── */}
      {error && (
        <div
          style={{
            padding: '12px 16px', borderRadius: 10, marginBottom: 24,
            background: 'rgba(180,70,70,0.08)',
            border: '1px solid rgba(180,70,70,0.25)',
            color: '#b44646', fontSize: 12,
          }}
        >
          ⚠ {error}
        </div>
      )}

      {/* ── Stat Cards ────────────────────────────────────────────── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: 18,
          marginBottom: 28,
        }}
      >
        {loading ? (
          [1, 2, 3, 4].map((k) => <SkeletonCard key={k} height={150} />)
        ) : (
          <>
            <StatCard
              label="Departments"
              value={summary?.departments.total ?? 0}
              icon="◉"
              sub="Active operational units"
              onClick={() => navigate('/departments')}
            />
            <StatCard
              label="Outcomes"
              value={summary?.outcomes.total ?? 0}
              icon="◆"
              sub={`${summary?.outcomes.achieved ?? 0} achieved · ${summary?.outcomes.at_risk ?? 0} at risk`}
              onClick={() => navigate('/outcomes')}
            />
            <StatCard
              label="Avg Progress"
              value={`${summary?.outcomes.avg_progress ?? 0}%`}
              icon="▲"
              sub="Across all active outcomes"
              accent="#468c64"
            />
            <StatCard
              label="Signals"
              value={summary?.signals.total ?? 0}
              icon="◈"
              sub={`${summary?.signals.critical ?? 0} critical · ${summary?.signals.warning ?? 0} warning`}
              accent={
                (summary?.signals.critical ?? 0) > 0
                  ? '#b44646'
                  : (summary?.signals.warning ?? 0) > 0
                  ? '#c4a45a'
                  : 'var(--neu-accent)'
              }
              onClick={() => navigate('/signals')}
            />
          </>
        )}
      </div>

      {/* ── Lower Grid: Signal Health + Recent Activity ────────────── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0,1fr) minmax(0,1.4fr)',
          gap: 20,
          alignItems: 'start',
        }}
      >
        {/* Signal Health Panel */}
        <div
          style={{
            background: 'var(--neu-bg)',
            borderRadius: 20,
            boxShadow: 'var(--neu-shadow-out)',
            padding: '24px',
          }}
        >
          <div style={{ marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div
                style={{
                  fontFamily: 'Rajdhani', fontWeight: 700, fontSize: 11,
                  letterSpacing: '0.15em', color: 'var(--neu-text-light)',
                  textTransform: 'uppercase', marginBottom: 2,
                }}
              >
                Signal Health
              </div>
              <div style={{ fontSize: 13, color: 'var(--neu-text-mid)' }}>
                Real-time system status
              </div>
            </div>
            <button
              onClick={() => navigate('/signals')}
              style={{
                fontSize: 11, fontFamily: 'Rajdhani', fontWeight: 700,
                color: 'var(--neu-accent)', background: 'none',
                border: 'none', cursor: 'pointer', padding: '4px 8px',
              }}
            >
              VIEW ALL →
            </button>
          </div>

          {loading ? (
            <SkeletonCard height={60} />
          ) : (
            <>
              <SignalHealthBar
                critical={summary?.signals.critical ?? 0}
                warning={summary?.signals.warning ?? 0}
                normal={summary?.signals.normal ?? 0}
                total={summary?.signals.total ?? 0}
              />

              {/* Status summary items */}
              <div style={{ marginTop: 20 }}>
                {[
                  {
                    label: 'Systems Normal',
                    value: summary?.signals.normal ?? 0,
                    color: '#468c64',
                    bg: 'rgba(70,140,100,0.08)',
                  },
                  {
                    label: 'Warnings Active',
                    value: summary?.signals.warning ?? 0,
                    color: '#c4a45a',
                    bg: 'rgba(196,164,90,0.08)',
                  },
                  {
                    label: 'Critical Alerts',
                    value: summary?.signals.critical ?? 0,
                    color: '#b44646',
                    bg: 'rgba(180,70,70,0.08)',
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '10px 14px', borderRadius: 10, marginBottom: 8,
                      background: item.bg,
                    }}
                  >
                    <span style={{ fontSize: 12, color: item.color, fontWeight: 600 }}>
                      {item.label}
                    </span>
                    <span
                      style={{
                        fontSize: 16, fontFamily: 'Rajdhani', fontWeight: 800, color: item.color,
                      }}
                    >
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Recent Activity Panel */}
        <div
          style={{
            background: 'var(--neu-bg)',
            borderRadius: 20,
            boxShadow: 'var(--neu-shadow-out)',
            padding: '24px',
          }}
        >
          <div style={{ marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div
                style={{
                  fontFamily: 'Rajdhani', fontWeight: 700, fontSize: 11,
                  letterSpacing: '0.15em', color: 'var(--neu-text-light)',
                  textTransform: 'uppercase', marginBottom: 2,
                }}
              >
                Recent Activity
              </div>
              <div style={{ fontSize: 13, color: 'var(--neu-text-mid)' }}>
                Last 7 days of executions
              </div>
            </div>
            <button
              onClick={() => navigate('/activities')}
              style={{
                fontSize: 11, fontFamily: 'Rajdhani', fontWeight: 700,
                color: 'var(--neu-accent)', background: 'none',
                border: 'none', cursor: 'pointer', padding: '4px 8px',
              }}
            >
              VIEW ALL →
            </button>
          </div>

          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[1, 2, 3].map((k) => <SkeletonCard key={k} height={44} />)}
            </div>
          ) : summary?.recent_activity.length === 0 ? (
            <div
              style={{
                textAlign: 'center', padding: '36px 16px',
                color: 'var(--neu-text-light)', fontSize: 13,
              }}
            >
              <div style={{ fontSize: 32, marginBottom: 10, opacity: 0.3 }}>◎</div>
              No activity in the last 7 days
            </div>
          ) : (
            <div>
              {summary?.recent_activity.map((log) => (
                <ActivityRow
                  key={log.id}
                  name={log.activity_name}
                  status={log.status}
                  executedAt={log.executed_at}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Quick Nav Row ──────────────────────────────────────────── */}
      <div
        style={{
          marginTop: 28,
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
          gap: 12,
        }}
      >
        {[
          { label: 'Departments', path: '/departments', icon: '◉' },
          { label: 'Activities',  path: '/activities',  icon: '◎' },
          { label: 'Outcomes',    path: '/outcomes',    icon: '◆' },
          { label: 'Signals',     path: '/signals',     icon: '▲' },
          { label: 'Analytics',   path: '/analytics',   icon: '◷' },
          { label: 'Roles',       path: '/roles',       icon: '◧' },
        ].map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className="neu-btn-ghost"
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '12px 16px', borderRadius: 12,
              justifyContent: 'flex-start',
              fontSize: 12, fontWeight: 700,
              fontFamily: 'Rajdhani', letterSpacing: '0.06em',
            }}
          >
            <span style={{ color: 'var(--neu-accent)', fontSize: 14 }}>{item.icon}</span>
            {item.label.toUpperCase()}
          </button>
        ))}
      </div>
    </div>
  )
}