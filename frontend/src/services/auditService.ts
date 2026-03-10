import api from './api';

export interface AuditEntry {
  id: string
  activity_name: string
  department_name: string
  executor_name: string
  status: string
  executed_at: string
  notes: string | null
}

export interface AuditResponse {
  logs: AuditEntry[];
  total: number;
  page: number;
  pages: number;
}

export async function getAuditLog(page = 1, action = '', user_id = ''): Promise<AuditResponse> {
  const res = await api.get<AuditResponse>('/admin/audit-log', {
    params: { page, action, user_id }
  });
  return res.data;
}