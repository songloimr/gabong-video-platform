import { createQuery } from '@tanstack/svelte-query';
import { api } from '../client';
import type { Playlist, PaginatedResponse, Video, ApiResponse } from '$lib/types';

export function usePlaylists(paramsGetter?: () => { page?: number; limit?: number }) {
  return createQuery(() => {
    const params = paramsGetter?.() || { page: 1, limit: 25 };
    return {
      queryKey: ['playlists', params.page, params.limit],
      queryFn: async () => {
        const { data } = await api.get<PaginatedResponse<Playlist>>('/api/playlists', {
          params: {
            page: params.page || 1,
            limit: params.limit || 25,
          },
        });
        return data;
      },
    };
  });
}

export function usePlaylist(slugGetter: () => string) {
  return createQuery(() => {
    const slug = slugGetter();
    return {
      queryKey: ['playlist', slug],
      queryFn: async () => {
        const { data } = await api.get<ApiResponse<Playlist & { videos: Array<Video & { position: number }> }>>(`/api/playlists/${slug}`);
        return data.data;
      },
      enabled: !!slug,
    };
  });
}

// Admin query - fetches all playlists including hidden ones
export function useAdminPlaylists(paramsGetter?: () => { page?: number; limit?: number }) {
  return createQuery(() => {
    const params = paramsGetter?.() || { page: 1, limit: 25 };
    return {
      queryKey: ['admin', 'playlists', params.page, params.limit],
      queryFn: async () => {
        const { data } = await api.get<PaginatedResponse<Playlist>>('/api/admin/playlists', {
          params: {
            page: params.page || 1,
            limit: params.limit || 25,
          },
        });
        return data;
      },
    };
  });
}

export function useAdminPlaylistById(idGetter: () => string) {
  return createQuery(() => {
    const id = idGetter();
    return {
      queryKey: ['admin', 'playlist', id],
      queryFn: async () => {
        const { data } = await api.get<ApiResponse<Playlist & { videos: Array<Video & { position: number }> }>>(`/api/playlists/id/${id}`);
        return data.data;
      },
      enabled: !!id,
    };
  });
}
