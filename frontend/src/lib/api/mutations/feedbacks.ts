import { createMutation, useQueryClient } from '@tanstack/svelte-query';
import { api } from '../client';
import type { CreateFeedbackDto, Feedback } from '$lib/types';

export function useCreateFeedback() {
  const queryClient = useQueryClient();

  return createMutation(() => ({
    mutationFn: async (dto: CreateFeedbackDto) => {
      const validTypes = ['bug', 'suggestion', 'other'];
      if (!validTypes.includes(dto.type)) throw new Error('Invalid feedback type');
      if (dto.title.length > 200) throw new Error('Title must be at most 200 characters');
      if (dto.title.length < 1) throw new Error('Title is required');
      if (dto.content.length > 5000) throw new Error('Content must be at most 5000 characters');
      if (dto.content.length < 1) throw new Error('Content is required');
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
