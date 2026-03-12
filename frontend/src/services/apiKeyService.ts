import api from './api';

export interface ApiKey {
  id: number; name: string; key_prefix: string;
  is_active: boolean; last_used_at: string | null; created_at: string | null;
}

export async function listApiKeys(): Promise<ApiKey[]> {
  const res = await api.get<{ keys: ApiKey[] }>('/api-keys');
  return res.data.keys;
}

export async function createApiKey(name: string): Promise<{ key: ApiKey; raw_key: string }> {
  const res = await api.post<{ key: ApiKey; raw_key: string }>('/api-keys', { name });
  return res.data;
}

export async function revokeApiKey(id: number): Promise<void> {
  await api.delete(`/api-keys/${id}`);
}

export async function toggleApiKey(id: number): Promise<{ is_active: boolean }> {
  const res = await api.put<{ is_active: boolean }>(`/api-keys/${id}/toggle`);
  return res.data;
}