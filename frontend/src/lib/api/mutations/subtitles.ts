import { createMutation, useQueryClient } from '@tanstack/svelte-query';
import { api } from '../client';

export function useCreateSubtitle() {
  const queryClient = useQueryClient();
  return createMutation(() => ({
    mutationFn: async (data: { video_id: string; label: string; language_code: string; vtt_content: string }) => {
      const { data: response } = await api.post('/api/subtitles', data);
      return response;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['subtitles', variables.video_id] });
    },
  }));
}

export function useUpdateSubtitle() {
  const queryClient = useQueryClient();
  return createMutation(() => ({
    mutationFn: async ({ id, videoId, ...data }: { id: string; videoId: string; label?: string; language_code?: string; vtt_content?: string }) => {
      const { data: response } = await api.put(`/api/subtitles/${id}`, data);
      return response;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['subtitles', variables.videoId] });
    },
  }));
}

export function useDeleteSubtitle() {
  const queryClient = useQueryClient();
  return createMutation(() => ({
    mutationFn: async ({ id, videoId }: { id: string; videoId: string }) => {
      const { data: response } = await api.delete(`/api/subtitles/${id}`);
      return response;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['subtitles', variables.videoId] });
    },
  }));
}

export function useCreateVideoMarkup() {
  const queryClient = useQueryClient();
  return createMutation(() => ({
    mutationFn: async (data: { video_id: string; title: string; timestamp_seconds: number; description?: string }) => {
      const { data: response } = await api.post('/api/video-markups', data);
      return response;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['video-markups', variables.video_id] });
    },
  }));
}

export function useUpdateVideoMarkup() {
  const queryClient = useQueryClient();
  return createMutation(() => ({
    mutationFn: async ({ id, videoId, ...data }: { id: string; videoId: string; title?: string; timestamp_seconds?: number; description?: string }) => {
      const { data: response } = await api.put(`/api/video-markups/${id}`, data);
      return response;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['video-markups', variables.videoId] });
    },
  }));
}

export function useDeleteVideoMarkup() {
  const queryClient = useQueryClient();
  return createMutation(() => ({
    mutationFn: async ({ id, videoId }: { id: string; videoId: string }) => {
      const { data: response } = await api.delete(`/api/video-markups/${id}`);
      return response;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['video-markups', variables.videoId] });
    },
  }));
}
