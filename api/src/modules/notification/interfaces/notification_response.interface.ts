export interface NotificationResponse {
  id: string;
  notification_language_id?: string;
  published: boolean;
  title: string;
  slug?: string;
  created_at: Date;
  updated_at: Date;
}

export interface DeleteNotificationResponse {
  id: string;
}
