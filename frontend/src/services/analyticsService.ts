import api from './api'
import type { ApiResponse } from '../types/auth'

export interface TrendPoint {
  day:       string
  total:     number
  completed: number
  failed:    number
}

export interface DeptPerf {
  name:           string
  avg_progress:   number
  activity_count: number
  outcome_count:  number
}

export interface OutcomeStatus {
  achieved:    number
  on_track:    number
  at_risk:     number
  not_started: number
}

export interface SignalDist {
  normal:   number
  warning:  number
  critical: number
}

export interface TopOutcome {
  name:     string
  progress: number
  status:   string
  unit:     string
}

export interface AnalyticsOverview {
  activity_trend:   TrendPoint[]
  dept_performance: DeptPerf[]
  outcome_status:   OutcomeStatus
  signal_dist:      SignalDist
  top_outcomes:     TopOutcome[]
}

const analyticsService = {
  async getOverview(): Promise<ApiResponse<AnalyticsOverview>> {
    const r = await api.get<ApiResponse<AnalyticsOverview>>('/auth/analytics/overview')
    return r.data
  },
}

export default analyticsService