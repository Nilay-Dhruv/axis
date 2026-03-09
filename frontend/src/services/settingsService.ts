import api from './api'
import type { ApiResponse } from '../types/auth'

export interface ProfileData {
  id: string
  email: string
  full_name: string
  subscription_tier: string
  organization_id: string | null
  is_active: boolean
}

const settingsService = {

  async getProfile(): Promise<ApiResponse<{ user: ProfileData }>> {
    const response = await api.get<ApiResponse<{ user: ProfileData }>>('/auth/profile')
    return response.data
  },

  async updateProfile(full_name: string): Promise<ApiResponse<{ full_name: string }>> {
    const response = await api.put<ApiResponse<{ full_name: string }>>(
      '/auth/profile',
      { full_name }
    )
    return response.data
  },

  async changePassword(
    current_password: string,
    new_password: string,
    confirm_password: string
  ): Promise<ApiResponse<Record<string, never>>> {
    const response = await api.post<ApiResponse<Record<string, never>>>(
      '/auth/change-password',
      { current_password, new_password, confirm_password }
    )
    return response.data
  },
}

export default settingsService