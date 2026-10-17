export interface ApiErrorBody {
  statusCode: number;
  code: string;
  message: string | string[];
  details?: string | string[];
  requestId?: string;
}
export interface Paginated<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
}
