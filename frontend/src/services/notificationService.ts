import api from './api';

export interface Notification {
  id: string;
  type: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  url: string;
}

export interface NotificationsResponse {
  notifications: Notification[];
  unread_count: number;
}

export async function getNotifications(): Promise<NotificationsResponse> {
  const res = await api.get<NotificationsResponse>('/auth/notifications');
  return res.data;
}