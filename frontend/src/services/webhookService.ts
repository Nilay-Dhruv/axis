import api from './api';

export interface Webhook {
  id: number; name: string; url: string;
  events: string[]; secret: string | null;
  is_active: boolean; delivery_count: number;
  created_at: string | null;
}

export async function listWebhooks(): Promise<{ webhooks: Webhook[]; available_events: string[] }> {
  const res = await api.get('/webhooks');
  return res.data;
}

export async function createWebhook(payload: { name: string; url: string; events: string[] }): Promise<Webhook> {
  const res = await api.post<{ webhook: Webhook }>('/webhooks', payload);
  return res.data.webhook;
}

export async function deleteWebhook(id: number): Promise<void> {
  await api.delete(`/webhooks/${id}`);
}

export async function toggleWebhook(id: number): Promise<{ is_active: boolean }> {
  const res = await api.put<{ is_active: boolean }>(`/webhooks/${id}/toggle`);
  return res.data;
}

export async function testWebhook(id: number): Promise<{ success: boolean; status_code: number | null; error: string | null }> {
  const res = await api.post(`/webhooks/${id}/test`);
  return res.data;
}