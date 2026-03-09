import { useMemo } from 'react'
import { useSelector } from 'react-redux'
import type { RootState } from '../store/store'
import {
  buildDeptPerformance,
  buildOutcomeTrend,
  buildActivityExecTrend,
  buildSignalHealthTrend,
  buildSummary,
} from '../services/analyticsService'

export function useAnalytics() {
  const departments  = useSelector((s: RootState) => s.departments.list)
  const outcomes     = useSelector((s: RootState) => s.outcomes.list)
  const activities   = useSelector((s: RootState) => s.activities.list)
  const alerts       = useSelector((s: RootState) => s.outcomes.alerts)
  const outcomeSummary = useSelector((s: RootState) => s.outcomes.summary)

  const normalCount   = outcomeSummary?.normal_signals   ?? 0
  const warningCount  = outcomeSummary?.warning_signals  ?? 0
  const criticalCount = outcomeSummary?.critical_signals ?? 0

  // All computed from existing state — no extra API calls
  const deptPerformance = useMemo(
    () => buildDeptPerformance(departments, outcomes, activities),
    [departments, outcomes, activities]
  )

  const outcomeTrend = useMemo(
    () => buildOutcomeTrend(outcomes),
    [outcomes]
  )

  const activityExecTrend = useMemo(
    () => buildActivityExecTrend(activities.length * 3),
    [activities.length]
  )

  const signalHealthTrend = useMemo(
    () => buildSignalHealthTrend(normalCount, warningCount, criticalCount),
    [normalCount, warningCount, criticalCount]
  )

  const summary = useMemo(
    () => buildSummary(outcomes, activities, alerts, activities.length * 3),
    [outcomes, activities, alerts]
  )

  const hasData = departments.length > 0 || outcomes.length > 0

  return {
    deptPerformance,
    outcomeTrend,
    activityExecTrend,
    signalHealthTrend,
    summary,
    hasData,
    departments,
    outcomes,
    activities,
    alerts,
    outcomeSummary,
  }
}