import { createMutation, useQueryClient } from '@tanstack/svelte-query';
import { api } from '../client';

export function useAddComment() {
  const queryClient = useQueryClient();

  return createMutation(() => ({
    mutationFn: async ({ videoId, content, parentId }: { videoId: string; content: string; parentId?: string }) => {
      const { data } = await api.post(`/api/videos/${videoId}/comments`, { content, parent_id: parentId });
      return data;
    },
    onSuccess: (_, { videoId, parentId }) => {
      queryClient.invalidateQueries({ queryKey: ['comments', videoId, parentId] });
      queryClient.invalidateQueries({ queryKey: ['comments', videoId] });
    },
  }));
}

export function useDeleteComment() {
  const queryClient = useQueryClient();

  return createMutation(() => ({
    mutationFn: async (commentId: string) => {
      await api.delete(`/api/comments/${commentId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments'] });
    },
  }));
}

export function useHideComment() {
  const queryClient = useQueryClient();

  return createMutation(() => ({
    mutationFn: async ({ commentId, isHidden }: { commentId: string; isHidden: boolean }) => {
      const { data } = await api.put(`/api/comments/${commentId}/hide`, { is_hidden: isHidden });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments'] });
    },
  }));
}
