import { HttpNoneResponse } from './http_none_response.interface';

export type HttpPagingResponse<T> = HttpNoneResponse & {
  data: {
    pages: number;
    page: number;
    data: T[] | T | null;
    count?: number;
  };
};
