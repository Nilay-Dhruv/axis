import api from './api';

export interface AutomationRun {
  id: number;
  automation_id: number;
  status: 'success' | 'failed' | 'skipped';
  detail: string | null;
  ran_at: string | null;
}

export interface Automation {
  id: number;
  name: string;
  description: string | null;
  trigger: string;
  condition: Record<string, unknown> | null;
  action: string;
  action_config: Record<string, unknown> | null;
  is_enabled: boolean;
  run_count: number;
  last_run_at: string | null;
  created_at: string | null;
}

export interface AutomationPayload {
  name: string;
  description?: string;
  trigger: string;
  condition?: Record<string, unknown>;
  action: string;
  action_config?: Record<string, unknown>;
  is_enabled?: boolean;
}

export async function listAutomations(): Promise<Automation[]> {
  const res = await api.get<{ automations: Automation[] }>('/automations');
  return res.data.automations;
}

export async function createAutomation(payload: AutomationPayload): Promise<Automation> {
  const res = await api.post<{ automation: Automation }>('/automations', payload);
  return res.data.automation;
}

export async function updateAutomation(id: number, payload: Partial<AutomationPayload>): Promise<Automation> {
  const res = await api.put<{ automation: Automation }>(`/automations/${id}`, payload);
  return res.data.automation;
}

export async function deleteAutomation(id: number): Promise<void> {
  await api.delete(`/automations/${id}`);
}

export async function toggleAutomation(id: number): Promise<{ is_enabled: boolean }> {
  const res = await api.put<{ is_enabled: boolean }>(`/automations/${id}/toggle`);
  return res.data;
}

export async function runAutomation(id: number): Promise<AutomationRun> {
  const res = await api.post<{ run: AutomationRun }>(`/automations/${id}/run`);
  return res.data.run;
}

export async function getAutomationDetail(id: number): Promise<{ automation: Automation; runs: AutomationRun[] }> {
  const res = await api.get<{ automation: Automation; runs: AutomationRun[] }>(`/automations/${id}`);
  return res.data;
}