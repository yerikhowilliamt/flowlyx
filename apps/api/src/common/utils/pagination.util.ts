import { PaginatedResponse } from '../dto/paginated-response.dto';

export function createPaginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  limit: number,
): PaginatedResponse<T> {
  return new PaginatedResponse<T>(data, {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  });
}
