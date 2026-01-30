import { createMutation, useQueryClient } from '@tanstack/svelte-query';
import { api } from '../client';
import type { CreateFeedbackDto, Feedback } from '$lib/types';

export function useCreateFeedback() {
  const queryClient = useQueryClient();

  return createMutation(() => ({
    mutationFn: async (dto: CreateFeedbackDto) => {
      const { data } = await api.post<Feedback>('/api/feedbacks', dto);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'feedbacks'] });
    },
  }));
}

export function useDeleteFeedback() {
  const queryClient = useQueryClient();

  return createMutation(() => ({
    mutationFn: async (id: string) => {
      await api.delete(`/api/admin/feedbacks/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'feedbacks'] });
    },
  }));
}
