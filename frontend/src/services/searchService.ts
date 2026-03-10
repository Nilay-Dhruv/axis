import api from './api';

export interface SearchResult {
  type: 'department' | 'outcome' | 'signal' | 'activity';
  id: number;
  title: string;
  subtitle: string;
  url: string;
}

export interface SearchResponse {
  results: SearchResult[];
  total: number;
}

export async function globalSearch(q: string): Promise<SearchResponse> {
  const res = await api.get<SearchResponse>('/search', { params: { q } });
  return res.data;
}