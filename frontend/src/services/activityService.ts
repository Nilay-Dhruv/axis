import api from './api'
import type { ApiResponse } from '../types/auth'
import type { Activity, ActivityDetail, ActivityLog } from '../types/department'

const activityService = {

  async getAll(departmentId?: string): Promise<ApiResponse<{
    activities: Activity[]
    total: number
    locked: number
  }>> {
    const params = departmentId ? `?department_id=${departmentId}` : ''
    const response = await api.get<ApiResponse<{
      activities: Activity[]
      total: number
      locked: number
    }>>(`/activities${params}`)
    return response.data
  },

  async getById(id: string): Promise<ApiResponse<ActivityDetail>> {
    const response = await api.get<ApiResponse<ActivityDetail>>(`/activities/${id}`)
    return response.data
  },

  async create(payload: {
    name: string
    type: string
    description?: string
    department_id: string
    tier_required?: string
    config?: Record<string, unknown>
  }): Promise<ApiResponse<{ activity: Activity }>> {
    const response = await api.post<ApiResponse<{ activity: Activity }>>(
      '/activities',
      payload
    )
    return response.data
  },

  async update(
    id: string,
    data: Partial<Activity>
  ): Promise<ApiResponse<{ activity: Activity }>> {
    const response = await api.put<ApiResponse<{ activity: Activity }>>(
      `/activities/${id}`,
      data
    )
    return response.data
  },

  async remove(id: string): Promise<ApiResponse<Record<string, never>>> {
    const response = await api.delete<ApiResponse<Record<string, never>>>(
      `/activities/${id}`
    )
    return response.data
  },

  async execute(
    id: string,
    notes?: string,
    data?: Record<string, unknown>
  ): Promise<ApiResponse<{ log: ActivityLog; activity: Activity }>> {
    const response = await api.post<ApiResponse<{ log: ActivityLog; activity: Activity }>>(
      `/activities/${id}/execute`,
      { notes, data }
    )
    return response.data
  },

  async getRecentLogs(limit = 10): Promise<ApiResponse<{
    logs: ActivityLog[]
    total: number
  }>> {
    const response = await api.get<ApiResponse<{
      logs: ActivityLog[]
      total: number
    }>>(`/activities/recent-logs?limit=${limit}`)
    return response.data
  },
}

export default activityService