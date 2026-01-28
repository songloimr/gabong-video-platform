import { createQuery } from '@tanstack/svelte-query';
import { api } from '../client';
import type { PaginatedResponse, DashboardStatsResponse, User } from '$lib/types';


export function useAdminDashboardStats() {
  return createQuery(() => ({
    queryKey: ['admin', 'dashboard', 'stats'],
    queryFn: async () => {
      const { data } = await api.get<{ data: DashboardStatsResponse }>('/api/admin/dashboard/stats');
      return data.data;
    },
  }));
}



export function useAdminUsers(paramsGetter: () => { page?: number; limit?: number; status?: string; search?: string }) {
  return createQuery(() => {
    const params = paramsGetter();
    return {
      queryKey: ['admin', 'users', params],
      queryFn: async () => {
        const { data } = await api.get<PaginatedResponse<User>>('/api/admin/users', {
          params,
        });
        return data;
      },
    };
  });
}
