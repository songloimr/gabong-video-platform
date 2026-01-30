import { createQuery } from '@tanstack/svelte-query';
import { api } from '../client';
import type { Feedback } from '$lib/types';

interface FeedbacksResponse {
  data: Feedback[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export function useAdminFeedbacks(
  paramsGetter: () => { page?: number; limit?: number; type?: string },
) {
  return createQuery(() => {
    const params = paramsGetter();
    return {
      queryKey: ['admin', 'feedbacks', params],
      queryFn: async () => {
        const { data } = await api.get<FeedbacksResponse>('/api/admin/feedbacks', {
          params,
        });
        return data;
      },
    };
  });
}
