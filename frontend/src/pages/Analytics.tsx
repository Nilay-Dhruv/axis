import { useEffect, useState, type ReactElement } from 'react'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import analyticsService from '../services/analyticsService'
import type { AnalyticsOverview } from '../services/analyticsService'
import type { AxiosError } from 'axios'

// ─── Constants ────────────────────────────────────────────────────────────────

const NEU_ACCENT   = '#5aa9c4'
const NEU_ACCENT2  = '#7ec8e3'
const COLOR_GREEN  = '#468c64'
const COLOR_YELLOW = '#c4a45a'
const COLOR_RED    = '#b44646'
const COLOR_GRAY   = '#8096aa'

const STATUS_COLORS: Record<string, string> = {
  achieved:    COLOR_GREEN,
  on_track:    NEU_ACCENT,
  at_risk:     COLOR_RED,
  not_started: COLOR_GRAY,
}

const SIGNAL_COLORS: Record<string, string> = {
  normal:   COLOR_GREEN,
  warning:  COLOR_YELLOW,
  critical: COLOR_RED,
}

// ─── Sub-components ───────────────────────────────────────────────────────────

interface PanelProps {
  title:    string
  subtitle?: string
  children: ReactElement | ReactElement[]
  style?:   React.CSSProperties
}

function Panel({ title, subtitle, children, style }: PanelProps): ReactElement {
  return (
    <div
      style={{
        background: 'var(--neu-bg)',
        borderRadius: 20,
        boxShadow: 'var(--neu-shadow-out)',
        padding: '24px 28px',
        ...style,
      }}
    >
      <div style={{ marginBottom: 20 }}>
        <div
          style={{
            fontFamily: 'Rajdhani', fontWeight: 700, fontSize: 11,
            letterSpacing: '0.15em', color: 'var(--neu-text-light)',
            textTransform: 'uppercase', marginBottom: 3,
          }}
        >
          {title}
        </div>
        {subtitle && (
          <div style={{ fontSize: 12, color: 'var(--neu-text-light)' }}>{subtitle}</div>
        )}
      </div>
      {children}
    </div>
  )
}

interface StatPillProps {
  label: string
  value: number
  color: string
}

function StatPill({ label, value, color }: StatPillProps): ReactElement {
  return (
    <div
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 14px', borderRadius: 10, marginBottom: 8,
        background: `${color}12`,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }} />
        <span style={{ fontSize: 12, color: 'var(--neu-text-mid)', fontWeight: 600, textTransform: 'capitalize' }}>
          {label.replace('_', ' ')}
        </span>
      </div>
      <span style={{ fontFamily: 'Rajdhani', fontWeight: 800, fontSize: 18, color }}>
        {value}
      </span>
    </div>
  )
}

interface SkeletonPanelProps { height?: number }

function SkeletonPanel({ height = 280 }: SkeletonPanelProps): ReactElement {
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

// Custom tooltip for charts
function NeuTooltip({ active, payload, label }: {
  active?: boolean
  payload?: { name: string; value: number; color: string }[]
  label?: string
}): ReactElement | null {
  if (!active || !payload?.length) return null
  return (
    <div
      style={{
        background: '#e6ecf3',
        borderRadius: 12,
        boxShadow: '6px 6px 16px #c3cdd8, -6px -6px 16px #ffffff',
        padding: '10px 14px',
        fontSize: 12,
        color: 'var(--neu-text-dark)',
      }}
    >
      {label && <div style={{ fontFamily: 'Rajdhani', fontWeight: 700, marginBottom: 6, color: 'var(--neu-text-light)', fontSize: 10, letterSpacing: '0.1em' }}>{label}</div>}
      {payload.map((p) => (
        <div key={p.name} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: p.color, flexShrink: 0 }} />
          <span style={{ fontWeight: 600, textTransform: 'capitalize' }}>{p.name}:</span>
          <span style={{ fontFamily: 'Rajdhani', fontWeight: 800 }}>{p.value}</span>
        </div>
      ))}
    </div>
  )
}

// ─── Date range filter ────────────────────────────────────────────────────────

type Range = '7d' | '14d' | '30d'

interface RangeFilterProps {
  value:    Range
  onChange: (r: Range) => void
}

function RangeFilter({ value, onChange }: RangeFilterProps): ReactElement {
  return (
    <div
      style={{
        display: 'flex', gap: 4,
        background: 'var(--neu-bg)',
        boxShadow: 'var(--neu-shadow-in)',
        borderRadius: 30, padding: 4,
      }}
    >
      {(['7d', '14d', '30d'] as Range[]).map((r) => (
        <button
          key={r}
          onClick={() => onChange(r)}
          style={{
            padding: '5px 14px', borderRadius: 26, border: 'none',
            background: value === r ? 'var(--neu-bg)' : 'transparent',
            boxShadow: value === r ? 'var(--neu-shadow-out)' : 'none',
            color: value === r ? 'var(--neu-accent)' : 'var(--neu-text-light)',
            fontSize: 11, fontFamily: 'Rajdhani', fontWeight: 700,
            letterSpacing: '0.06em', cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          {r.toUpperCase()}
        </button>
      ))}
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Analytics(): ReactElement {
  const [data,    setData]    = useState<AnalyticsOverview | null>(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState<string | null>(null)
  const [range,   setRange]   = useState<Range>('30d')

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const res = await analyticsService.getOverview()
        setData(res.data)
      } catch (err) {
        const e = err as AxiosError<{ error: { message: string } }>
        setError(e.response?.data?.error?.message ?? 'Failed to load analytics')
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [])

  // Filter trend data by selected range
  const trendData = (() => {
    if (!data) return []
    const days = range === '7d' ? 7 : range === '14d' ? 14 : 30
    return data.activity_trend.slice(-days).map((p) => ({
      ...p,
      day: new Date(p.day).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    }))
  })()

  // Pie data for outcome status
  const outcomePieData = data
    ? Object.entries(data.outcome_status).map(([key, val]) => ({
        name:  key,
        value: val,
        color: STATUS_COLORS[key] ?? COLOR_GRAY,
      })).filter((d) => d.value > 0)
    : []

  // Pie data for signal distribution
  const signalPieData = data
    ? Object.entries(data.signal_dist).map(([key, val]) => ({
        name:  key,
        value: val,
        color: SIGNAL_COLORS[key] ?? COLOR_GRAY,
      })).filter((d) => d.value > 0)
    : []

  return (
    <div className="neu-fade-up">

      {/* ── Header ── */}
      <div
        style={{
          display: 'flex', alignItems: 'flex-start',
          justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12,
        }}
      >
        <div>
          <div
            style={{
              fontFamily: 'Rajdhani', fontWeight: 700, fontSize: 11,
              letterSpacing: '0.2em', color: 'var(--neu-text-light)',
              textTransform: 'uppercase', marginBottom: 4,
            }}
          >
            Intelligence Overview
          </div>
          <div style={{ fontSize: 13, color: 'var(--neu-text-mid)' }}>
            Live performance data across all departments
          </div>
        </div>
        <RangeFilter value={range} onChange={setRange} />
      </div>

      {/* ── Error ── */}
      {error && (
        <div style={{
          padding: '12px 16px', borderRadius: 10, marginBottom: 24,
          background: 'rgba(180,70,70,0.08)',
          border: '1px solid rgba(180,70,70,0.25)',
          color: '#b44646', fontSize: 12,
        }}>
          ⚠ {error}
        </div>
      )}

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <SkeletonPanel height={300} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <SkeletonPanel height={260} />
            <SkeletonPanel height={260} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <SkeletonPanel height={240} />
            <SkeletonPanel height={240} />
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* ── Row 1: Activity Trend (full width) ── */}
          <Panel
            title="Activity Execution Trend"
            subtitle={`Last ${range === '7d' ? '7' : range === '14d' ? '14' : '30'} days — completed vs failed executions`}
          >
            <>
              {trendData.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--neu-text-light)', fontSize: 13 }}>
                  <div style={{ fontSize: 32, marginBottom: 10, opacity: 0.3 }}>◎</div>
                  No activity executions in this period
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={trendData} margin={{ top: 5, right: 10, bottom: 0, left: -20 }}>
                    <defs>
                      <linearGradient id="gradCompleted" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor={NEU_ACCENT}  stopOpacity={0.3} />
                        <stop offset="95%" stopColor={NEU_ACCENT}  stopOpacity={0}   />
                      </linearGradient>
                      <linearGradient id="gradFailed" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor={COLOR_RED} stopOpacity={0.25} />
                        <stop offset="95%" stopColor={COLOR_RED} stopOpacity={0}    />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#d4e0ec" vertical={false} />
                    <XAxis
                      dataKey="day"
                      tick={{ fontSize: 10, fill: '#8096aa', fontFamily: 'Rajdhani', fontWeight: 600 }}
                      axisLine={false} tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 10, fill: '#8096aa', fontFamily: 'Rajdhani', fontWeight: 600 }}
                      axisLine={false} tickLine={false} allowDecimals={false}
                    />
                    <Tooltip content={<NeuTooltip />} />
                    <Legend
                      wrapperStyle={{ fontSize: 11, fontFamily: 'Rajdhani', fontWeight: 700, paddingTop: 12 }}
                    />
                    <Area
                      type="monotone" dataKey="completed" name="Completed"
                      stroke={NEU_ACCENT} strokeWidth={2}
                      fill="url(#gradCompleted)" dot={false} activeDot={{ r: 4 }}
                    />
                    <Area
                      type="monotone" dataKey="failed" name="Failed"
                      stroke={COLOR_RED} strokeWidth={2}
                      fill="url(#gradFailed)" dot={false} activeDot={{ r: 4 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </>
          </Panel>

          {/* ── Row 2: Dept Performance + Outcome Status ── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.4fr) minmax(0,1fr)', gap: 20 }}>

            {/* Department performance bar chart */}
            <Panel title="Department Performance" subtitle="Average outcome progress by department">
              <>
                {(data?.dept_performance.length ?? 0) === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--neu-text-light)', fontSize: 13 }}>
                    No department data
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart
                      data={data?.dept_performance}
                      layout="vertical"
                      margin={{ top: 0, right: 16, bottom: 0, left: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#d4e0ec" horizontal={false} />
                      <XAxis
                        type="number" domain={[0, 100]}
                        tick={{ fontSize: 10, fill: '#8096aa', fontFamily: 'Rajdhani', fontWeight: 600 }}
                        axisLine={false} tickLine={false}
                        tickFormatter={(v) => `${v}%`}
                      />
                      <YAxis
                        type="category" dataKey="name" width={90}
                        tick={{ fontSize: 10, fill: '#4a5e72', fontFamily: 'Rajdhani', fontWeight: 700 }}
                        axisLine={false} tickLine={false}
                      />
                      <Tooltip
                        content={<NeuTooltip />}
                      />
                      <Bar
                        dataKey="avg_progress" name="Avg Progress"
                        radius={[0, 6, 6, 0]} maxBarSize={18}
                      >
                        {data?.dept_performance.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={
                              entry.avg_progress >= 75
                                ? COLOR_GREEN
                                : entry.avg_progress >= 40
                                ? NEU_ACCENT
                                : COLOR_YELLOW
                            }
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </>
            </Panel>

            {/* Outcome status breakdown */}
            <Panel title="Outcome Status" subtitle="Distribution across all outcomes">
              <>
                {outcomePieData.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--neu-text-light)', fontSize: 13 }}>
                    No outcomes yet
                  </div>
                ) : (
                  <>
                    <ResponsiveContainer width="100%" height={140}>
                      <PieChart>
                        <Pie
                          data={outcomePieData}
                          cx="50%" cy="50%"
                          innerRadius={42} outerRadius={64}
                          paddingAngle={3} dataKey="value"
                        >
                          {outcomePieData.map((entry, i) => (
                            <Cell key={i} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          content={<NeuTooltip />}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div style={{ marginTop: 8 }}>
                      {outcomePieData.map((d) => (
                        <StatPill key={d.name} label={d.name} value={d.value} color={d.color} />
                      ))}
                    </div>
                  </>
                )}
              </>
            </Panel>
          </div>

          {/* ── Row 3: Top Outcomes + Signal Distribution ── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.4fr) minmax(0,1fr)', gap: 20 }}>

            {/* Top outcomes progress */}
            <Panel title="Top Outcomes by Progress" subtitle="Highest performing outcomes across departments">
              <>
                {(data?.top_outcomes.length ?? 0) === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--neu-text-light)', fontSize: 13 }}>
                    No outcomes yet
                  </div>
                ) : (
                  <div>
                    {data?.top_outcomes.map((o, i) => (
                      <div
                        key={i}
                        style={{
                          marginBottom: 16,
                          paddingBottom: 16,
                          borderBottom: i < (data.top_outcomes.length - 1) ? '1px solid var(--neu-divider)' : 'none',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, alignItems: 'center' }}>
                          <span
                            style={{
                              fontSize: 12, fontWeight: 600, color: 'var(--neu-text-dark)',
                              flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                              paddingRight: 12,
                            }}
                          >
                            {o.name}
                          </span>
                          <span
                            style={{
                              fontSize: 13, fontFamily: 'Rajdhani', fontWeight: 800,
                              color: o.progress >= 100
                                ? COLOR_GREEN
                                : o.progress >= 60
                                ? NEU_ACCENT
                                : COLOR_YELLOW,
                              flexShrink: 0,
                            }}
                          >
                            {o.progress}%
                          </span>
                        </div>
                        <div
                          style={{
                            height: 6, borderRadius: 3,
                            background: 'var(--neu-bg)',
                            boxShadow: 'var(--neu-shadow-in)',
                            overflow: 'hidden',
                          }}
                        >
                          <div
                            style={{
                              height: '100%',
                              width: `${o.progress}%`,
                              borderRadius: 3,
                              background: o.progress >= 100
                                ? COLOR_GREEN
                                : o.progress >= 60
                                ? `linear-gradient(90deg, ${NEU_ACCENT}, ${NEU_ACCENT2})`
                                : COLOR_YELLOW,
                              transition: 'width 0.6s ease',
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            </Panel>

            {/* Signal health distribution */}
            <Panel title="Signal Health" subtitle="Current status distribution">
              <>
                {signalPieData.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--neu-text-light)', fontSize: 13 }}>
                    No signals yet
                  </div>
                ) : (
                  <>
                    <ResponsiveContainer width="100%" height={140}>
                      <PieChart>
                        <Pie
                          data={signalPieData}
                          cx="50%" cy="50%"
                          innerRadius={42} outerRadius={64}
                          paddingAngle={3} dataKey="value"
                          startAngle={90} endAngle={-270}
                        >
                          {signalPieData.map((entry, i) => (
                            <Cell key={i} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip content={<NeuTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div style={{ marginTop: 8 }}>
                      {signalPieData.map((d) => (
                        <StatPill key={d.name} label={d.name} value={d.value} color={d.color} />
                      ))}
                    </div>
                  </>
                )}
              </>
            </Panel>
          </div>

        </div>
      )}
    </div>
  )
}