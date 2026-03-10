import api from './api';

export interface TrendPoint { date: string; value: number; }

export interface SignalDetailData {
  signal: {
    id: number;
    name: string;
    description: string | null;
    status: string;
    value: string | number | null;
    threshold: string | number | null;
    outcome_id: number | null;
    outcome_title: string | null;
    created_at: string | null;
    updated_at: string | null;
  };
  trend: TrendPoint[];
  alert_count: number;
}

export async function getSignalDetail(id: string): Promise<SignalDetailData> {
  const res = await api.get<SignalDetailData>(`/signals/${id}/detail`);
  return res.data;
}