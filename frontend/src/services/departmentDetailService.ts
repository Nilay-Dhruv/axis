import api from './api';

export interface DeptDetailData {
  department: {
    id: number;
    name: string;
    description: string | null;
    head: string | null;
    created_at: string | null;
  };
  stats: {
    outcome_count: number;
    signal_count: number;
    activity_count: number;
    avg_progress: number;
    outcome_status_breakdown: Record<string, number>;
  };
  recent_activities: {
    id: number;
    title: string;
    status: string;
    created_at: string | null;
  }[];
  outcomes: {
    id: number;
    title: string;
    status: string;
    progress: number;
  }[];
}

export async function getDepartmentDetail(id: string): Promise<DeptDetailData> {
  const res = await api.get<DeptDetailData>(`/departments/${id}/detail`);
  return res.data;
}