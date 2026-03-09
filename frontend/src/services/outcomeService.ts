import api from './api'
import type { ApiResponse } from '../types/auth'
import type { Outcome, Signal, OutcomeWithSignals, OutcomeSummary } from '../types/department'

const outcomeService = {

  async getAll(departmentId?: string): Promise<ApiResponse<{
    outcomes: Outcome[]
    total: number
  }>> {
    const params = departmentId ? `?department_id=${departmentId}` : ''
    const response = await api.get<ApiResponse<{
      outcomes: Outcome[]
      total: number
    }>>(`/outcomes${params}`)
    return response.data
  },

  async getById(id: string): Promise<ApiResponse<OutcomeWithSignals>> {
    const response = await api.get<ApiResponse<OutcomeWithSignals>>(`/outcomes/${id}`)
    return response.data
  },

  async getSummary(): Promise<ApiResponse<{ summary: OutcomeSummary }>> {
    const response = await api.get<ApiResponse<{ summary: OutcomeSummary }>>(
      '/outcomes/summary'
    )
    return response.data
  },

  async getAlerts(): Promise<ApiResponse<{ alerts: Signal[]; total: number }>> {
    const response = await api.get<ApiResponse<{ alerts: Signal[]; total: number }>>(
      '/outcomes/alerts'
    )
    return response.data
  },

  async create(payload: {
    name: string
    description?: string
    target_value?: number
    current_value?: number
    unit?: string
    department_id: string
  }): Promise<ApiResponse<{ outcome: Outcome }>> {
    const response = await api.post<ApiResponse<{ outcome: Outcome }>>(
      '/outcomes',
      payload
    )
    return response.data
  },

  async update(
    id: string,
    data: Partial<Outcome>
  ): Promise<ApiResponse<{ outcome: Outcome }>> {
    const response = await api.put<ApiResponse<{ outcome: Outcome }>>(
      `/outcomes/${id}`,
      data
    )
    return response.data
  },

  async remove(id: string): Promise<ApiResponse<Record<string, never>>> {
    const response = await api.delete<ApiResponse<Record<string, never>>>(
      `/outcomes/${id}`
    )
    return response.data
  },

  async createSignal(
    outcomeId: string,
    payload: {
      name: string
      value?: number
      threshold_min?: number
      threshold_max?: number
    }
  ): Promise<ApiResponse<{ signal: Signal }>> {
    const response = await api.post<ApiResponse<{ signal: Signal }>>(
      `/outcomes/${outcomeId}/signals`,
      payload
    )
    return response.data
  },

  async updateSignal(
    outcomeId: string,
    signalId: string,
    data: Partial<Signal>
  ): Promise<ApiResponse<{ signal: Signal }>> {
    const response = await api.put<ApiResponse<{ signal: Signal }>>(
      `/outcomes/${outcomeId}/signals/${signalId}`,
      data
    )
    return response.data
  },

  async deleteSignal(
    outcomeId: string,
    signalId: string
  ): Promise<ApiResponse<Record<string, never>>> {
    const response = await api.delete<ApiResponse<Record<string, never>>>(
      `/outcomes/${outcomeId}/signals/${signalId}`
    )
    return response.data
  },
}

export default outcomeService