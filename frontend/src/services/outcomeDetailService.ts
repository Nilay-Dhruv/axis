import api from './api';

export interface ProgressPoint {
  date: string;
  progress: number;
}

export interface LinkedSignal {
  id: number;
  name: string;
  status: string;
  value: string | number | null;
  created_at: string | null;
}

export interface OutcomeDetailData {
  outcome: {
    id: number;
    name: string;
    description: string | null;
    status: string;
    progress: number;
    department: string;
    department_id: number;
    created_at: string | null;
    updated_at: string | null;
  };
  progress_history: ProgressPoint[];
  linked_signals: LinkedSignal[];
}

export async function getOutcomeDetail(id: string): Promise<OutcomeDetailData> {
  const res = await api.get<OutcomeDetailData>(`/outcomes/${id}/detail`);
  return res.data;
}