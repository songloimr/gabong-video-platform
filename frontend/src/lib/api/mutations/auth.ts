import { createMutation } from '@tanstack/svelte-query';
import { api } from '../client';
import type { AuthResponse } from '$lib/types';
import { auth } from '$lib/stores/auth.svelte';
import { queryClient } from '../client';

export function useRegister() {
  return createMutation(() => ({
    mutationFn: async (payload: { username: string; password: string; email?: string }) => {
      const { data } = await api.post<AuthResponse>('/api/auth/register', payload);
      auth.setAuth(data.data);
      return data.data;
    },
  }));
}

export function useLogin() {
  return createMutation(() => ({
    mutationFn: async (payload: { username: string; password: string; remember_me?: boolean }) => {
      const { data: response } = await api.post<AuthResponse>('/api/auth/login', payload);
      return response.data;
    },
  }));
}

export function useLogout() {
  return createMutation(() => ({
    mutationFn: async () => {
      const refreshToken = auth.refresh_token;
      if (refreshToken) {
        await api.post('/api/auth/logout', { refresh_token: refreshToken });
      }
      auth.clearAuth();
      queryClient.clear();
    },
  }));
}

export function useRefreshToken() {
  return createMutation(() => ({
    mutationFn: async (refreshToken: string) => {
      const { data } = await api.post<AuthResponse>('/api/auth/refresh', { refresh_token: refreshToken });
      auth.setAuth(data.data);
      return data.data;
    },
  }));
}

