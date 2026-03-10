import api from './api'
import type { ApiResponse } from '../types/auth'

export interface DashboardSummary {
  departments: { total: number }
  outcomes: {
    total:        number
    achieved:     number
    at_risk:      number
    avg_progress: number
  }
  signals: {
    total:    number
    critical: number
    warning:  number
    normal:   number
  }
  recent_activity: {
    id:            string
    activity_name: string
    status:        string
    executed_at:   string | null
  }[]
}

const dashboardService = {
  async getSummary(): Promise<ApiResponse<DashboardSummary>> {
    const r = await api.get<ApiResponse<DashboardSummary>>('/auth/dashboard/summary')
    return r.data
  },
}

export default dashboardService