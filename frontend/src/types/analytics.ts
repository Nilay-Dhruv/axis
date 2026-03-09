export interface TrendPoint {
  date: string
  value: number
  label?: string
}

export interface DeptPerformance {
  name: string
  color: string
  outcomes: number
  achieved: number
  at_risk: number
  activities: number
  score: number
}

export interface SignalHealthPoint {
  date: string
  normal: number
  warning: number
  critical: number
}

export interface ActivityExecPoint {
  date: string
  completed: number
  failed: number
  total: number
}

export interface AnalyticsSummary {
  total_outcomes: number
  achieved_outcomes: number
  at_risk_outcomes: number
  total_activities: number
  total_executions: number
  critical_signals: number
  warning_signals: number
  org_health_score: number
}