import api from './api';

export type ExportResource = 'outcomes' | 'signals' | 'activities' | 'departments';

export async function exportCSV(resource: ExportResource): Promise<void> {
  const res = await api.get(`/auth/export/${resource}`, { responseType: 'blob' });
  const url = window.URL.createObjectURL(new Blob([res.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${resource}_export.csv`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}