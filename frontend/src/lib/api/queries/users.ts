import { createQuery } from '@tanstack/svelte-query';
import { api } from '../client';
import type { User, Video, PaginatedResponse } from '$lib/types';

export function useProfile() {
  return createQuery(() => ({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data } = await api.get<User>('/api/profile');
      return data;
    },
  }));
}

export function useUser(username: string) {
  return createQuery(() => ({
    queryKey: ['user', username],
    queryFn: async () => {
      const { data } = await api.get<User & { uploaded_videos: Video[] }>(`/api/users/${username}`);
      return data;
    },
    enabled: !!username,
  }));
}
