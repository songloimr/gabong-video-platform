import { createMutation, useQueryClient } from '@tanstack/svelte-query';
import { api } from '../client';
import type { ApiError, ApiResponse } from '$lib/types';

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return createMutation(() => ({
    mutationFn: async (data: { email?: string; bio?: string }) => {
      const { data: response } = await api.put('/api/profile', data);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  }));
}

export function useUpdateAvatar() {
  const queryClient = useQueryClient();

  return createMutation(() => ({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('avatar', file);
      const { data: response } = await api.put<ApiResponse<{ avatar_url: string }>>('/api/profile/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  }));
}

export function useUpdateUserStatus() {
  const queryClient = useQueryClient();

  return createMutation(() => ({
    mutationFn: async ({ userId, status, reason }: { userId: string; status: 'active' | 'suspended' | 'banned'; reason?: string }) => {
      const { data } = await api.put(`/api/admin/users/${userId}/status`, { status, reason });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
  }));
}
