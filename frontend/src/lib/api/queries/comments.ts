import { createInfiniteQuery } from '@tanstack/svelte-query';
import { api } from '../client';
import type { Comment, PaginatedResponse } from '$lib/types';

export function useComments(
  videoIdGetter: () => string,
  parentIdGetter?: () => string | undefined,
  enabledGetter: () => boolean = () => true
) {
  return createInfiniteQuery(() => {
    const videoId = videoIdGetter();
    const parentId = parentIdGetter?.();
    const enabled = enabledGetter();

    return {
      queryKey: ['comments', videoId, parentId],
      queryFn: async ({ pageParam = 0 }) => {
        const { data } = await api.get<PaginatedResponse<Comment>>(`/api/videos/${videoId}/comments`, {
          params: { parent_id: parentId, limit: 10, offset: pageParam },
        });
        return data;
      },
      initialPageParam: 0,
      getNextPageParam: (lastPage, allPages) => {
        const currentCount = allPages.reduce((acc, page) => acc + page.data.length, 0);
        return lastPage.has_more ? currentCount : undefined;
      },
      enabled: !!videoId && enabled,
    };
  });
}
