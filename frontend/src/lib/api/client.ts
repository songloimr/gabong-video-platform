import { QueryClient } from '@tanstack/svelte-query';
import axios from 'axios';
import { auth } from '$lib/stores/auth.svelte';
import { goto } from '$app/navigation';
import { PUBLIC_VITE_API_URL } from '$env/static/public';
import { errorDialog } from '$lib/stores/errorDialog.svelte';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
});



export const api = axios.create({
  baseURL: PUBLIC_VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  if (auth.access_token) {
    config.headers.Authorization = `Bearer ${auth.access_token}`;
  }
  return config;
});

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle rate limit (429)
    if (error.response?.status === 429) {
      const retryAfter = error.response.headers['retry-after'];
      const message = retryAfter 
        ? `Too many requests. Please wait ${retryAfter} seconds and try again.`
        : 'Too many requests. Please wait a moment and try again.';
      errorDialog.show('Rate Limit Exceeded', message);
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      if (!auth.refresh_token) {
        auth.clearAuth();
        if (typeof window !== 'undefined') {
          goto('/auth/login');
        }
        return Promise.reject(error);
      }

      try {
        const response = await axios.post(
          `${PUBLIC_VITE_API_URL}/api/auth/refresh`,
          { refresh_token: auth.refresh_token },
          { headers: { 'Content-Type': 'application/json' } }
        );

        const { access_token, refresh_token: newRefreshToken } = response.data;
        auth.setAuth({ ...auth.state, access_token, refresh_token: newRefreshToken });
        processQueue(null, access_token);
        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        auth.clearAuth();
        if (typeof window !== 'undefined') {
          goto('/auth/login');
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

