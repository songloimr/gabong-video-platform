import { createQuery } from '@tanstack/svelte-query';
import { api } from '../client';
import type { WatchLater, PaginatedResponse, Video } from '$lib/types';

export function useWatchLater(page = 1, limit = 12) {
  return createQuery(() => ({
    queryKey: ['watch-later', page, limit],
    queryFn: async () => {
      const { data } = await api.get<PaginatedResponse<WatchLater>>('/api/watch-later', {
        params: { page, limit },
      });
      return data;
    },
  }));
}
