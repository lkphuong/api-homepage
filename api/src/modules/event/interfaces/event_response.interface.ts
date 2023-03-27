export interface EventResponse {
  id: string;
  event_language_id?: string;
  title: string;
  slug?: string;
  start_date: Date;
  end_date: Date;
  published: boolean;
  file?: {
    id: string;
    url: string;
    name: string;
    type: string;
  };
}

export interface DeleteEventResponse {
  id: string;
}
