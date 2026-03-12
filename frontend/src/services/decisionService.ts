import api from './api';

export interface DecisionOption { id: number; title: string; description: string | null; is_selected: boolean; }
export interface DecisionCriteria { id: number; name: string; weight: number; }
export interface DecisionScore { option_id: number; criteria_id: number; score: number; }

export interface Decision {
  id: number; title: string; description: string | null;
  status: string; outcome_id: number | null;
  option_count: number; criteria_count: number;
  decided_at: string | null; created_at: string | null;
}

export interface DecisionFull extends Decision {
  options: DecisionOption[];
  criteria: DecisionCriteria[];
}

export async function listDecisions(): Promise<Decision[]> {
  const res = await api.get<{ decisions: Decision[] }>('/decisions');
  return res.data.decisions;
}

export async function createDecision(payload: {
  title: string; description?: string; status?: string;
  outcome_id?: number; options?: { title: string }[]; criteria?: { name: string; weight: number }[];
}): Promise<Decision> {
  const res = await api.post<{ decision: Decision }>('/decisions', payload);
  return res.data.decision;
}

export async function getDecision(id: number): Promise<{ decision: DecisionFull; scores: DecisionScore[] }> {
  const res = await api.get(`/decisions/${id}`);
  return res.data;
}

export async function updateDecision(id: number, payload: Partial<Decision>): Promise<Decision> {
  const res = await api.put<{ decision: Decision }>(`/decisions/${id}`, payload);
  return res.data.decision;
}

export async function deleteDecision(id: number): Promise<void> {
  await api.delete(`/decisions/${id}`);
}

export async function saveScores(decisionId: number, scores: DecisionScore[]): Promise<void> {
  await api.post(`/decisions/${decisionId}/score`, scores);
}