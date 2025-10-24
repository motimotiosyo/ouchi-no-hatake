export type NotificationType = 'like' | 'comment' | 'reply' | 'favorite';

export interface NotificationActor {
  id: number;
  name: string;
}

export interface NotificationNotifiable {
  type: 'Post' | 'Comment' | 'GrowthRecord';
  id: number;
  post_id?: number; // Commentの場合のみ
}

export interface Notification {
  id: number;
  notification_type: NotificationType;
  message: string;
  read: boolean;
  created_at: string;
  actor: NotificationActor;
  notifiable: NotificationNotifiable;
}

export interface NotificationPagination {
  current_page: number;
  per_page: number;
  total_count: number;
  total_pages: number;
}

export interface NotificationsResponse {
  notifications: Notification[];
  pagination: NotificationPagination;
}

export interface UnreadCountResponse {
  unread_count: number;
}
