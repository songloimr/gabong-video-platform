import { createQuery } from '@tanstack/svelte-query';
import { api } from '../client';
import type { Tag, PaginatedResponse, Video, VideoListParams } from '$lib/types';

export function useTags(search?: string, limit = 20) {
  return createQuery(() => ({
    queryKey: ['tags', search, limit],
    queryFn: async () => {
      const { data } = await api.get<{ data: Tag[] }>('/api/tags', {
        params: { search, limit },
      });
      return data.data;
    },
  }));
}

export function useSearch(query: string, params?: Omit<VideoListParams, 'search'>) {
  return createQuery(() => ({
    queryKey: ['search', query, params],
    queryFn: async () => {
      const { data } = await api.get<PaginatedResponse<Video>>('/api/search', {
        params: { q: query, ...params },
      });
      return data;
    },
    enabled: !!query && query.length > 2,
  }));
}
