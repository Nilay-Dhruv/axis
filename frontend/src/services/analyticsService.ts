import type {
  DeptPerformance,
  AnalyticsSummary,
  TrendPoint,
  ActivityExecPoint,
  SignalHealthPoint,
} from '../types/analytics'
import type { Outcome, Activity, Signal, Department } from '../types/department'

// ─── Client-side analytics derived from existing Redux state ───────────────
// No extra API calls needed — we compute from data already loaded.

export function buildDeptPerformance(
  departments: Department[],
  outcomes: Outcome[],
  activities: Activity[]
): DeptPerformance[] {
  return departments.map((dept) => {
    const deptOutcomes   = outcomes.filter((o) => o.department_id === dept.id)
    const deptActivities = activities.filter((a) => a.department_id === dept.id)
    const achieved       = deptOutcomes.filter((o) => o.status === 'achieved').length
    const at_risk        = deptOutcomes.filter((o) => o.status === 'at_risk').length
    const total          = deptOutcomes.length

    const score = total === 0
      ? 0
      : Math.round(
          ((achieved * 100) + (deptActivities.length * 5)) /
          Math.max(total + 1, 1)
        )

    return {
      name:       dept.name.length > 10 ? dept.name.slice(0, 10) : dept.name,
      color:      dept.config?.color ?? 'var(--cyan)',
      outcomes:   total,
      achieved,
      at_risk,
      activities: deptActivities.length,
      score:      Math.min(score, 100),
    }
  }).filter((d) => d.outcomes > 0 || d.activities > 0)
}

export function buildOutcomeTrend(outcomes: Outcome[]): TrendPoint[] {
  // Simulate weekly progress trend from current values
  const weeks  = 8
  const result: TrendPoint[] = []
  const now    = new Date()

  for (let i = weeks - 1; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i * 7)

    const achieved = outcomes.filter((o) => o.status === 'achieved').length
    const total    = outcomes.length
    const baseRate = total > 0 ? (achieved / total) * 100 : 0

    // Add simulated variance for earlier weeks
    const variance = (Math.random() - 0.5) * 10 * (i / weeks)
    const value    = Math.max(0, Math.min(100, baseRate - (i * 4) + variance))

    result.push({
      date:  date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      value: Math.round(value * 10) / 10,
    })
  }

  return result
}

export function buildActivityExecTrend(executionCount: number): ActivityExecPoint[] {
  const days   = 14
  const result: ActivityExecPoint[] = []
  const now    = new Date()

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)

    const completed = Math.max(0, Math.round((executionCount / days) + (Math.random() - 0.3) * 3))
    const failed    = Math.max(0, Math.round(Math.random() * 1.5))

    result.push({
      date:      date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      completed,
      failed,
      total:     completed + failed,
    })
  }

  return result
}

export function buildSignalHealthTrend(
  normalCount: number,
  warningCount: number,
  criticalCount: number
): SignalHealthPoint[] {
  const days   = 14
  const result: SignalHealthPoint[] = []
  const now    = new Date()
  const total  = normalCount + warningCount + criticalCount

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now)
    date.setDate(date.getDate() - i)

    const critVar = Math.max(0, Math.round(criticalCount + (Math.random() - 0.5) * 2 + (i * 0.3)))
    const warnVar = Math.max(0, Math.round(warningCount  + (Math.random() - 0.5) * 2 + (i * 0.2)))
    const normVar = Math.max(0, total - critVar - warnVar)

    result.push({
      date:     date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      normal:   normVar,
      warning:  warnVar,
      critical: critVar,
    })
  }

  return result
}

export function buildSummary(
  outcomes: Outcome[],
  activities: Activity[],
  signals: Signal[],
  executionCount: number
): AnalyticsSummary {
  const achieved  = outcomes.filter((o) => o.status === 'achieved').length
  const at_risk   = outcomes.filter((o) => o.status === 'at_risk').length
  const critical  = signals.filter((s) => s.status === 'critical').length
  const warning   = signals.filter((s) => s.status === 'warning').length
  const total     = outcomes.length

  const healthScore = total === 0 ? 0 : Math.round(
    ((achieved / total) * 40) +
    (Math.max(0, 1 - (critical / Math.max(signals.length, 1))) * 40) +
    (Math.max(0, 1 - (at_risk  / Math.max(total, 1))) * 20)
  )

  return {
    total_outcomes:    total,
    achieved_outcomes: achieved,
    at_risk_outcomes:  at_risk,
    total_activities:  activities.length,
    total_executions:  executionCount,
    critical_signals:  critical,
    warning_signals:   warning,
    org_health_score:  healthScore,
  }
}