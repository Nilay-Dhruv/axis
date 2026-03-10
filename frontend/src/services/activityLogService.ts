// frontend/src/services/activityLogService.ts
import api from './api';

export interface ActivityLog {
  id: string;
  activity_id: string;
  activity_name: string;
  department_id: string;
  department_name: string;
  executed_by: string;
  executor_name: string;
  status: 'success' | 'failed' | 'pending';
  notes: string | null;
  result_data: Record<string, unknown>;
  executed_at: string;
}

export interface LogFilters {
  page?: number;
  per_page?: number;
  department_id?: string;
  status?: string;
  date_from?: string;
  date_to?: string;
}

export interface PaginatedLogs {
  logs: ActivityLog[];
  pagination: {
    total: number;
    pages: number;
    current_page: number;
    per_page: number;
    has_next: boolean;
    has_prev: boolean;
  };
}

const activityLogService = {
  getLogs: async (filters: LogFilters = {}): Promise<PaginatedLogs> => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, val]) => {
      if (val !== undefined && val !== '') params.append(key, String(val));
    });
    const response = await api.get(`/activities/logs?${params.toString()}`);
    return response.data.data;
  },

  createLog: async (data: Partial<ActivityLog>) => {
    const response = await api.post('/activities/logs', data);
    return response.data.data;
  }
};

export default activityLogService;