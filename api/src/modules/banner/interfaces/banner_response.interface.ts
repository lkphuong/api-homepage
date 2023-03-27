export interface BannerResponse {
  id: string;
  banner_language_id?: string;
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

export interface DeleteBannerResponse {
  id: string;
}
