import { createQuery } from '@tanstack/svelte-query';
import { api } from '../client';
import type { Category, PaginatedResponse } from '$lib/types';

export function useCategories() {
  return createQuery(() => ({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data } = await api.get<PaginatedResponse<Category>>('/api/categories');
      return data;
    },
  }));
}

export function useCategory(slug: string) {
  return createQuery(() => ({
    queryKey: ['category', slug],
    queryFn: async () => {
      const { data } = await api.get<Category>(`/api/categories/${slug}`);
      return data;
    },
    enabled: !!slug,
  }));
}
