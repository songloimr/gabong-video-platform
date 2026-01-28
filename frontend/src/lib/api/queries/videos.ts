import { createQuery } from '@tanstack/svelte-query';
import { api } from '../client';
import type { Video, VideoListParams, PaginatedResponse } from '$lib/types';

export const videoKeys = {
  all: ['videos'] as const,
  lists: () => [...videoKeys.all, 'list'] as const,
  list: (params: VideoListParams) => [...videoKeys.lists(), params] as const,
  details: () => [...videoKeys.all, 'detail'] as const,
  detail: (slug: string) => [...videoKeys.details(), slug] as const,
};

export function useVideos(paramsGetter: () => VideoListParams) {
  return createQuery(() => {
    const params = paramsGetter();
    return {
      queryKey: videoKeys.list(params),
      queryFn: async () => {
        const { data } = await api.get<PaginatedResponse<Video[]>>('/api/videos', { params });
        return data;
      },
    };
  });
}

export function useVideo(slug: string) {
  return createQuery(() => ({
    queryKey: videoKeys.detail(slug),
    queryFn: async () => {
      const { data } = await api.get<Video>(`/api/videos/${slug}`);
      return data;
    },
    enabled: !!slug,
  }));
}

export function useAdminVideos(paramsGetter: () => VideoListParams & { status?: string }) {
  return createQuery(() => {
    const params = paramsGetter();
    return {
      queryKey: [...videoKeys.lists(), 'admin', params] as const,
      queryFn: async () => {
        const { data } = await api.get<PaginatedResponse<Video>>('/api/admin/videos', { params });
        return data;
      },
    };
  });
}

export function useFeaturedVideos(limitGetter?: () => number) {
  return createQuery(() => ({
    queryKey: ['featured', limitGetter?.() ?? 10] as const,
    queryFn: async () => {
      const limit = limitGetter?.() ?? 10;
      const { data } = await api.get<Video[]>(`/api/videos/featured`, { params: { limit } });
      return data;
    },
    staleTime: 2 * 60 * 1000,
  }));
}
