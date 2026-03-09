import api from './api'
import type { ApiResponse } from '../types/auth'
import type { Role, RoleDetail, RoleAssignment, PermissionMatrix } from '../types/department'

const roleService = {

  async getAll(): Promise<ApiResponse<{ roles: Role[]; total: number }>> {
    const r = await api.get<ApiResponse<{ roles: Role[]; total: number }>>('/roles')
    return r.data
  },

  async getById(id: string): Promise<ApiResponse<RoleDetail>> {
    const r = await api.get<ApiResponse<RoleDetail>>(`/roles/${id}`)
    return r.data
  },

  async getPermissions(): Promise<ApiResponse<{ matrix: PermissionMatrix; all: string[]; total: number }>> {
    const r = await api.get<ApiResponse<{ matrix: PermissionMatrix; all: string[]; total: number }>>('/roles/permissions')
    return r.data
  },

  async getMyPermissions(): Promise<ApiResponse<{ permissions: string[]; roles: Role[]; role_count: number }>> {
    const r = await api.get<ApiResponse<{ permissions: string[]; roles: Role[]; role_count: number }>>('/roles/my-permissions')
    return r.data
  },

  async create(payload: {
    name: string
    description?: string
    permissions: string[]
    tier_required?: string
  }): Promise<ApiResponse<{ role: Role }>> {
    const r = await api.post<ApiResponse<{ role: Role }>>('/roles', payload)
    return r.data
  },

  async update(id: string, data: Partial<Role>): Promise<ApiResponse<{ role: Role }>> {
    const r = await api.put<ApiResponse<{ role: Role }>>(`/roles/${id}`, data)
    return r.data
  },

  async remove(id: string): Promise<ApiResponse<Record<string, never>>> {
    const r = await api.delete<ApiResponse<Record<string, never>>>(`/roles/${id}`)
    return r.data
  },

  async assign(roleId: string, userId: string, departmentId?: string): Promise<ApiResponse<{ assignment: RoleAssignment }>> {
    const r = await api.post<ApiResponse<{ assignment: RoleAssignment }>>(
      `/roles/${roleId}/assign`,
      { user_id: userId, department_id: departmentId }
    )
    return r.data
  },

  async revoke(roleId: string, userId: string): Promise<ApiResponse<Record<string, never>>> {
    const r = await api.post<ApiResponse<Record<string, never>>>(
      `/roles/${roleId}/revoke`,
      { user_id: userId }
    )
    return r.data
  },

  async checkPermission(permission: string): Promise<ApiResponse<{ permission: string; granted: boolean }>> {
    const r = await api.post<ApiResponse<{ permission: string; granted: boolean }>>(
      '/roles/check',
      { permission }
    )
    return r.data
  },
}

export default roleService