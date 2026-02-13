import { createMutation, useQueryClient } from '@tanstack/svelte-query';
import { api } from '../client';
import { videoKeys } from '../queries/videos';
import type { ApiResponse } from '$lib/types';

export function useLikeVideo() {
  const queryClient = useQueryClient();

  return createMutation(() => ({
    mutationFn: async (videoId: string) => {
      const { data } = await api.post(`/api/videos/${videoId}/like`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: videoKeys.all });
    },
  }));
}

export interface UploadVideoInput {
  title: string;
  description?: string;
  embed_url?: string;
  thumbnail_url?: string;
  category_id?: string;
  source_type: 'embed' | 'upload';
}

export interface UploadVideoResponse {
  id: string;
  slug: string;
  short_code: string;
}

export function useUploadVideo() {
  const queryClient = useQueryClient();

  return createMutation(() => ({
    mutationFn: async ({
      input,
      onProgress
    }: {
      input: UploadVideoInput | FormData;
      onProgress?: (progress: number) => void
    }): Promise<UploadVideoResponse> => {
      const { data } = await api.post<UploadVideoResponse>('/api/videos/upload', input, {
        headers: input instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : undefined,
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress?.(progress);
          }
        }
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: videoKeys.all });
    },
  }));
}

export function useTrackView() {
  return createMutation(() => ({
    mutationFn: async ({ videoId, watchPosition }: { videoId: string; watchPosition: number }) => {
      await api.post(`/api/videos/${videoId}/view`, { watch_position: watchPosition });
    },
  }));
}

export function useSaveToWatchLater() {
  const queryClient = useQueryClient();

  return createMutation(() => ({
    mutationFn: async (videoId: string) => {
      const { data: response } = await api.post<ApiResponse<{ is_saved: boolean }>>(`/api/watch-later/${videoId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watch-later'] });
    },
  }));
}

export function useUpdateWatchPosition() {
  return createMutation(() => ({
    mutationFn: async ({ videoId, watchPosition }: { videoId: string; watchPosition: number }) => {
      await api.put(`/api/watch-later/${videoId}`, { watch_position: watchPosition });
    },
  }));
}

export function useRemoveFromWatchLater() {
  const queryClient = useQueryClient();

  return createMutation(() => ({
    mutationFn: async (videoId: string) => {
      await api.delete(`/api/watch-later/${videoId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watch-later'] });
    },
  }));
}
