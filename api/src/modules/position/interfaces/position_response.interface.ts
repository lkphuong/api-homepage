export interface PositionResponse {
  id: string;
  position_language_id?: string;
  published: boolean;
  title: string;
  slug?: string;
  created_at: Date;
  updated_at: Date;
}

export interface DeleteNotificationResponse {
  id: string;
}
