import { apiClient } from '@/services/apiClient';
import type {
  NotificationsResponse,
  UnreadCountResponse,
} from '@/types/notification';

export const notificationApi = {
  /**
   * 通知一覧を取得
   */
  async getNotifications(page: number = 1): Promise<NotificationsResponse> {
    const response = await apiClient.get<NotificationsResponse>(`/api/v1/notifications?page=${page}`);
    if (!response.success) {
      throw new Error('Failed to fetch notifications');
    }
    return response.data;
  },

  /**
   * 未読通知数を取得
   */
  async getUnreadCount(): Promise<number> {
    const response = await apiClient.get<UnreadCountResponse>('/api/v1/notifications/unread_count');
    if (!response.success) {
      throw new Error('Failed to fetch unread count');
    }
    return response.data.unread_count;
  },

  /**
   * 通知を既読にする
   */
  async markAsRead(notificationId: number): Promise<void> {
    const response = await apiClient.patch(`/api/v1/notifications/${notificationId}/mark_as_read`);
    if (!response.success) {
      throw new Error('Failed to mark notification as read');
    }
  },

  /**
   * 全ての通知を既読にする
   */
  async markAllAsRead(): Promise<void> {
    const response = await apiClient.patch('/api/v1/notifications/mark_all_as_read');
    if (!response.success) {
      throw new Error('Failed to mark all notifications as read');
    }
  },
};
