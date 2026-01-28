import { createQuery } from '@tanstack/svelte-query';
import { api } from '../client';

export function useSubtitles(videoId: string) {
  return createQuery(() => ({
    queryKey: ['subtitles', videoId],
    queryFn: async () => {
      const { data } = await api.get(`/api/subtitles?videoId=${videoId}`);
      return data;
    },
    enabled: !!videoId,
  }));
}

export function useVideoMarkups(videoId: string) {
  return createQuery(() => ({
    queryKey: ['video-markups', videoId],
    queryFn: async () => {
      const { data } = await api.get(`/api/video-markups?videoId=${videoId}`);
      return data;
    },
    enabled: !!videoId,
  }));
}
