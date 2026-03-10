import api from './api'
import type { ApiResponse } from '../types/auth'
import type { Department, DepartmentDetail } from '../types/department'

const departmentService = {

  async getAll(): Promise<ApiResponse<{ departments: Department[]; total: number }>> {
    const response = await api.get<ApiResponse<{ departments: Department[]; total: number }>>(
      '/departments'
    )
    return response.data
  },

  async getById(id: string): Promise<ApiResponse<DepartmentDetail>> {
    const response = await api.get<ApiResponse<DepartmentDetail>>(`/departments/${id}`)
    return response.data
  },

  async create(
    name: string,
    type: string,
    config?: Record<string, unknown>
  ): Promise<ApiResponse<{ department: Department }>> {
    const response = await api.post<ApiResponse<{ department: Department }>>('/departments', {
      name,
      type,
      config,
    })
    return response.data
  },

  async update(
    id: string,
    data: { name?: string; config?: Record<string, unknown> }
  ): Promise<ApiResponse<{ department: Department }>> {
    const response = await api.put<ApiResponse<{ department: Department }>>(
      `/departments/${id}`,
      data
    )
    return response.data
  },

  async remove(id: string): Promise<ApiResponse<Record<string, never>>> {
    const response = await api.delete<ApiResponse<Record<string, never>>>(`/departments/${id}`)
    return response.data
  },
}

export default departmentService

export function getDepartments() {
    throw new Error('Function not implemented.');
}
