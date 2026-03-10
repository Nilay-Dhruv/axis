import api from './api';

export interface AdminUser {
  id: number;
  email: string;
  name: string;
  role: string;
  is_active: boolean;
  created_at: string | null;
}

export async function listUsers(): Promise<AdminUser[]> {
  const res = await api.get<{ users: AdminUser[] }>('/admin/users');
  return res.data.users;
}

export async function updateUserRole(userId: number, role: string): Promise<void> {
  await api.put(`/admin/users/${userId}/role`, { role });
}

export async function toggleUserActive(userId: number): Promise<{ is_active: boolean }> {
  const res = await api.put<{ is_active: boolean }>(`/admin/users/${userId}/deactivate`);
  return res.data;
}