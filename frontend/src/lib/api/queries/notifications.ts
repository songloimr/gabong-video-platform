import { createQuery } from '@tanstack/svelte-query';
import { api } from '../client';
import type { ApiResponse, Notification, PaginatedResponse } from '$lib/types';

export function useNotifications(isRead?: boolean, page = 1, limit = 10) {
  return createQuery(() => ({
    queryKey: ['notifications', isRead, page, limit],
    queryFn: async () => {
      const { data } = await api.get<PaginatedResponse<Notification> & { unread_count: number }>('/api/notifications', {
        params: { is_read: isRead, page, limit },
      });
      return data;
    },
  }));
}

export function useNotificationCount() {
  return createQuery(() => ({
    queryKey: ['notifications', 'count'],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<{ unread_count: number }>>('/api/notifications/count');
      return data.data.unread_count;
    },
    refetchInterval: 60_000,
  }));
}
