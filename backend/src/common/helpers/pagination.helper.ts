import { PaginationParams, PaginationMeta, PaginatedResponse } from '../../types';

export function calculateOffset(page: number, limit: number): number {
  return (page - 1) * limit;
}

export function buildPaginationMeta(
  total: number,
  page: number,
  limit: number,
): PaginationMeta {
  const total_pages = Math.ceil(total / limit);

  return {
    page,
    limit,
    total,
    total_pages,
    has_next: page < total_pages,
    has_prev: page > 1,
  };
}

export function paginate<T>(
  items: T[],
  total: number,
  params: PaginationParams,
): PaginatedResponse<T> {
  return {
    data: items,
    pagination: buildPaginationMeta(total, params.page, params.limit),
  };
}
