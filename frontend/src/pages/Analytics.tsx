import { type ReactElement } from 'react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { useAnalytics } from '../hooks/useAnalytics'
import { useOutcomes } from '../hooks/useOutcomes'
import { useActivities } from '../hooks/useActivities'
import { useDepartments } from '../hooks/useDepartments'
import ChartCard from '../components/analytics/ChartCard'
import HealthGauge from '../components/analytics/HealthGauge'
import MetricTile from '../components/analytics/MetricTile'

// ─── Recharts custom tooltip ───────────────────────────────────────────────

interface TooltipProps {
  active?: boolean
  payload?: { color: string; name: string; value: number }[]
  label?: string
}

function ChartTooltip({ active, payload, label }: TooltipProps): ReactElement | null {
  if (!active || !payload?.length) return null
  return (
    <div
      style={{
        background: 'var(--bg-elevated)',
        border: '1px solid var(--border-bright)',
        borderRadius: 6,
        padding: '8px 12px',
        fontSize: 11,
        fontFamily: 'Rajdhani',
      }}
    >
      <div style={{ color: 'var(--text-muted)', marginBottom: 4, letterSpacing: '0.08em' }}>
        {label}
      </div>
      {payload.map((p) => (
        <div
          key={p.name}
          style={{ color: p.color, fontWeight: 700, letterSpacing: '0.06em' }}
        >
          {p.name}: {p.value}
        </div>
      ))}
    </div>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────

export default function Analytics(): ReactElement {
  const {
    deptPerformance,
    outcomeTrend,
    activityExecTrend,
    signalHealthTrend,
    summary,
    hasData,
  } = useAnalytics()

  // Ensure sibling slices are loaded
  useOutcomes(true)
  useActivities(true)
  useDepartments()

  const noData = !hasData

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
          Command Intelligence
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
          Organization-wide performance analytics and signal trends
        </div>
      </div>

      {/* ── Empty state ───────────────────────────────────── */}
      {noData && (
        <div
          style={{
            textAlign: 'center',
            padding: '64px 24px',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            borderRadius: 10,
          }}
        >
          <div style={{ fontSize: 48, opacity: 0.15, marginBottom: 16 }}>◈</div>
          <div
            style={{
              fontFamily: 'Rajdhani',
              fontWeight: 700,
              fontSize: 18,
              color: 'var(--text-primary)',
              textTransform: 'uppercase',
              marginBottom: 8,
            }}
          >
            No Data Yet
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
            Visit Departments, Outcomes, and Activities first to seed data.
          </div>
        </div>
      )}

      {!noData && (
        <>
          {/* ── Top Metric Tiles ─────────────────────────── */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: 10,
              marginBottom: 20,
            }}
          >
            <MetricTile
              label="Outcomes Tracked"
              value={summary.total_outcomes}
              sub={`${summary.achieved_outcomes} achieved`}
              color="var(--cyan)"
              trend="up"
              trendValue={`${summary.achieved_outcomes} done`}
            />
            <MetricTile
              label="At Risk"
              value={summary.at_risk_outcomes}
              sub="need attention"
              color={summary.at_risk_outcomes > 0 ? 'var(--danger)' : 'var(--success)'}
              trend={summary.at_risk_outcomes > 0 ? 'down' : 'flat'}
              trendValue={summary.at_risk_outcomes > 0 ? 'Action needed' : 'On track'}
            />
            <MetricTile
              label="Critical Signals"
              value={summary.critical_signals}
              sub={`${summary.warning_signals} warnings`}
              color={summary.critical_signals > 0 ? 'var(--danger)' : 'var(--success)'}
              trend={summary.critical_signals > 0 ? 'down' : 'up'}
              trendValue={summary.critical_signals > 0 ? 'Investigate' : 'Healthy'}
            />
            <MetricTile
              label="Active Activities"
              value={summary.total_activities}
              sub="across all depts"
              color="var(--warning)"
              trend="up"
              trendValue="All depts"
            />
          </div>

          {/* ── Health Gauge + Outcome Trend ─────────────── */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '220px 1fr',
              gap: 16,
              marginBottom: 16,
            }}
          >
            {/* Health gauge */}
            <div
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                borderTop: '2px solid var(--cyan)',
                borderRadius: 10,
                padding: '14px 12px',
              }}
            >
              <div
                style={{
                  fontFamily: 'Rajdhani',
                  fontWeight: 700,
                  fontSize: 11,
                  letterSpacing: '0.15em',
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  marginBottom: 8,
                  textAlign: 'center',
                }}
              >
                Org Health
              </div>
              <HealthGauge score={summary.org_health_score} />
            </div>

            {/* Outcome completion trend */}
            <ChartCard
              title="Outcome Completion Trend"
              subtitle="8-week rolling completion rate %"
              accent="var(--cyan)"
              height={200}
            >
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={outcomeTrend} margin={{ top: 4, right: 16, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="cyanGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#00d4ff" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#00d4ff" stopOpacity={0}    />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tick={{ fill: 'var(--text-muted)', fontSize: 10, fontFamily: 'Rajdhani' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fill: 'var(--text-muted)', fontSize: 10, fontFamily: 'Rajdhani' }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `${v}%`}
                  />
                  <Tooltip content={<ChartTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="value"
                    name="Completion %"
                    stroke="#00d4ff"
                    strokeWidth={2}
                    fill="url(#cyanGrad)"
                    dot={false}
                    activeDot={{ r: 4, fill: '#00d4ff', stroke: 'var(--bg-elevated)', strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          {/* ── Activity Executions + Signal Health ──────── */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 16,
              marginBottom: 16,
            }}
          >
            {/* Activity execution bar chart */}
            <ChartCard
              title="Activity Executions"
              subtitle="Daily completed vs failed — 14 days"
              accent="var(--success)"
              height={220}
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={activityExecTrend}
                  margin={{ top: 4, right: 8, left: -24, bottom: 0 }}
                  barSize={8}
                  barGap={2}
                >
                  <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tick={{ fill: 'var(--text-muted)', fontSize: 9, fontFamily: 'Rajdhani' }}
                    axisLine={false}
                    tickLine={false}
                    interval={1}
                  />
                  <YAxis
                    tick={{ fill: 'var(--text-muted)', fontSize: 10, fontFamily: 'Rajdhani' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<ChartTooltip />} />
                  <Legend
                    wrapperStyle={{
                      fontSize: 10,
                      fontFamily: 'Rajdhani',
                      color: 'var(--text-muted)',
                      paddingTop: 4,
                    }}
                  />
                  <Bar dataKey="completed" name="Completed" fill="#00cc88" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="failed"    name="Failed"    fill="#ff4455" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* Signal health stacked area */}
            <ChartCard
              title="Signal Health Trend"
              subtitle="Normal / Warning / Critical — 14 days"
              accent="var(--warning)"
              height={220}
            >
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={signalHealthTrend}
                  margin={{ top: 4, right: 8, left: -24, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="normGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#00cc88" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#00cc88" stopOpacity={0.05} />
                    </linearGradient>
                    <linearGradient id="warnGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#ffaa00" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#ffaa00" stopOpacity={0.05} />
                    </linearGradient>
                    <linearGradient id="critGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#ff4455" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#ff4455" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tick={{ fill: 'var(--text-muted)', fontSize: 9, fontFamily: 'Rajdhani' }}
                    axisLine={false}
                    tickLine={false}
                    interval={1}
                  />
                  <YAxis
                    tick={{ fill: 'var(--text-muted)', fontSize: 10, fontFamily: 'Rajdhani' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<ChartTooltip />} />
                  <Legend
                    wrapperStyle={{
                      fontSize: 10,
                      fontFamily: 'Rajdhani',
                      color: 'var(--text-muted)',
                      paddingTop: 4,
                    }}
                  />
                  <Area type="monotone" dataKey="normal"   name="Normal"   stroke="#00cc88" fill="url(#normGrad)" strokeWidth={1.5} dot={false} />
                  <Area type="monotone" dataKey="warning"  name="Warning"  stroke="#ffaa00" fill="url(#warnGrad)" strokeWidth={1.5} dot={false} />
                  <Area type="monotone" dataKey="critical" name="Critical" stroke="#ff4455" fill="url(#critGrad)" strokeWidth={1.5} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>

          {/* ── Dept Performance ─────────────────────────── */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 16,
              marginBottom: 16,
            }}
          >
            {/* Bar: outcomes per dept */}
            <ChartCard
              title="Outcomes by Department"
              subtitle="Total · Achieved · At Risk"
              accent="#8866ff"
              height={240}
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={deptPerformance}
                  margin={{ top: 4, right: 8, left: -20, bottom: 0 }}
                  barSize={10}
                  barGap={2}
                >
                  <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: 'var(--text-muted)', fontSize: 10, fontFamily: 'Rajdhani' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: 'var(--text-muted)', fontSize: 10, fontFamily: 'Rajdhani' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<ChartTooltip />} />
                  <Legend
                    wrapperStyle={{
                      fontSize: 10,
                      fontFamily: 'Rajdhani',
                      color: 'var(--text-muted)',
                      paddingTop: 4,
                    }}
                  />
                  <Bar dataKey="outcomes"  name="Total"    radius={[2, 2, 0, 0]}>
                    {deptPerformance.map((entry, i) => (
                      <Cell key={i} fill={entry.color} opacity={0.7} />
                    ))}
                  </Bar>
                  <Bar dataKey="achieved"  name="Achieved" fill="#00cc88" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="at_risk"   name="At Risk"  fill="#ff4455" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            {/* Radar: dept performance scores */}
            <ChartCard
              title="Department Radar"
              subtitle="Activities · Outcomes · Score"
              accent="#ff6644"
              height={240}
            >
              {deptPerformance.length < 3 ? (
                <div
                  style={{
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column',
                    gap: 8,
                  }}
                >
                  <div style={{ fontSize: 28, opacity: 0.2 }}>◈</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    Need 3+ departments for radar
                  </div>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={deptPerformance} margin={{ top: 0, right: 20, left: 20, bottom: 0 }}>
                    <PolarGrid stroke="var(--border)" />
                    <PolarAngleAxis
                      dataKey="name"
                      tick={{ fill: 'var(--text-muted)', fontSize: 10, fontFamily: 'Rajdhani' }}
                    />
                    <Radar
                      name="Score"
                      dataKey="score"
                      stroke="var(--cyan)"
                      fill="var(--cyan)"
                      fillOpacity={0.15}
                      strokeWidth={1.5}
                    />
                    <Radar
                      name="Activities"
                      dataKey="activities"
                      stroke="#8866ff"
                      fill="#8866ff"
                      fillOpacity={0.1}
                      strokeWidth={1.5}
                    />
                    <Tooltip content={<ChartTooltip />} />
                    <Legend
                      wrapperStyle={{
                        fontSize: 10,
                        fontFamily: 'Rajdhani',
                        color: 'var(--text-muted)',
                      }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              )}
            </ChartCard>
          </div>

          {/* ── Dept Score Leaderboard ────────────────────── */}
          <div
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              borderTop: '2px solid var(--cyan)',
              borderRadius: 10,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                padding: '14px 18px',
                borderBottom: '1px solid var(--border)',
              }}
            >
              <div
                style={{
                  fontFamily: 'Rajdhani',
                  fontWeight: 700,
                  fontSize: 13,
                  letterSpacing: '0.08em',
                  color: 'var(--text-primary)',
                  textTransform: 'uppercase',
                }}
              >
                Department Leaderboard
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                Ranked by composite performance score
              </div>
            </div>

            <div style={{ padding: '8px 0' }}>
              {[...deptPerformance]
                .sort((a, b) => b.score - a.score)
                .map((dept, idx) => {
                  const barWidth = `${dept.score}%`
                  const rankColor =
                    idx === 0 ? '#ffd700' :
                    idx === 1 ? '#c0c0c0' :
                    idx === 2 ? '#cd7f32' :
                    'var(--text-muted)'

                  return (
                    <div
                      key={dept.name}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 14,
                        padding: '10px 18px',
                        borderBottom: '1px solid var(--border)',
                      }}
                    >
                      {/* Rank */}
                      <div
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: '50%',
                          background: idx < 3 ? `${rankColor}20` : 'var(--bg-elevated)',
                          border: `1px solid ${idx < 3 ? rankColor : 'var(--border)'}`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 11,
                          fontFamily: 'Rajdhani',
                          fontWeight: 700,
                          color: rankColor,
                          flexShrink: 0,
                        }}
                      >
                        {idx + 1}
                      </div>

                      {/* Dept dot + name */}
                      <div
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          background: dept.color,
                          flexShrink: 0,
                        }}
                      />
                      <div
                        style={{
                          fontFamily: 'Rajdhani',
                          fontWeight: 700,
                          fontSize: 13,
                          letterSpacing: '0.06em',
                          color: 'var(--text-primary)',
                          textTransform: 'uppercase',
                          width: 110,
                          flexShrink: 0,
                        }}
                      >
                        {dept.name}
                      </div>

                      {/* Progress bar */}
                      <div style={{ flex: 1, height: 6, background: 'var(--border)', borderRadius: 3, overflow: 'hidden' }}>
                        <div
                          style={{
                            height: '100%',
                            width: barWidth,
                            background: dept.color,
                            borderRadius: 3,
                            transition: 'width 0.6s ease',
                            boxShadow: `0 0 6px ${dept.color}`,
                          }}
                        />
                      </div>

                      {/* Stats */}
                      <div
                        style={{
                          display: 'flex',
                          gap: 16,
                          flexShrink: 0,
                          fontSize: 11,
                          color: 'var(--text-muted)',
                          fontFamily: 'Rajdhani',
                          fontWeight: 600,
                        }}
                      >
                        <span>
                          <span style={{ color: 'var(--text-secondary)' }}>{dept.outcomes}</span>
                          {' '}outcomes
                        </span>
                        <span>
                          <span style={{ color: 'var(--success)' }}>{dept.achieved}</span>
                          {' '}done
                        </span>
                        <span>
                          <span style={{ color: dept.color, fontSize: 14 }}>{dept.score}</span>
                          {' '}pts
                        </span>
                      </div>
                    </div>
                  )
                })}
            </div>
          </div>
        </>
      )}
    </div>
  )
}