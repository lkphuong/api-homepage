export interface SchedulePagingResponse {
  id: string;
  date: string;
  hour: string;
  timeframe: string;
  title: string;
  slug: string;
  published: boolean;
}

export interface ScheduleLanguageResponse {
  id: string;
  schedule_language_id?: string;
  title: string;
  slug: string;
  published: boolean;
  content: string;
  date: string;
  hour: string;
  timeframe: string;
  location: string;
  attendee: string;
}

export interface DeleteScheduleLanguageResponse {
  id: string;
}
