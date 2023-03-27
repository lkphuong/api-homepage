import { HttpNoneResponse } from './http_none_response.interface';

export type HttpResponse<T> = HttpNoneResponse & {
  data: T[] | T | null;
};
