import { createMutation, useQueryClient } from '@tanstack/svelte-query';
import { api } from '../client';
import type { Playlist, ApiResponse } from '$lib/types';

export interface CreatePlaylistDto {
    title: string;
    slug: string;
    description?: string;
    thumbnail_url?: string;
    is_public?: boolean;
}

export interface UpdatePlaylistDto {
    title?: string;
    description?: string;
    thumbnail_url?: string;
    is_public?: boolean;
}

export function useCreatePlaylist() {
    const queryClient = useQueryClient();

    return createMutation(() => ({
        mutationFn: async (dto: CreatePlaylistDto) => {
            const { data } = await api.post<ApiResponse<Playlist>>('/api/playlists', dto);
            return data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['playlists'] });
        },
    }));
}

export function useUpdatePlaylist() {
    const queryClient = useQueryClient();

    return createMutation(() => ({
        mutationFn: async ({ id, dto }: { id: string; dto: UpdatePlaylistDto }) => {
            const { data } = await api.put<ApiResponse<Playlist>>(`/api/playlists/${id}`, dto);
            return data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['playlists'] });
        },
    }));
}

export function useDeletePlaylist() {
    const queryClient = useQueryClient();

    return createMutation(() => ({
        mutationFn: async (id: string) => {
            await api.delete(`/api/playlists/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['playlists'] });
        },
    }));
}

export function useTogglePlaylistVisibility() {
    const queryClient = useQueryClient();

    return createMutation(() => ({
        mutationFn: async ({ id, is_public }: { id: string; is_public: boolean }) => {
            const { data } = await api.put<ApiResponse<Playlist>>(`/api/playlists/${id}`, { is_public });
            return data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['playlists'] });
        },
    }));
}

export function useAddVideosToPlaylist() {
    const queryClient = useQueryClient();

    return createMutation(() => ({
        mutationFn: async ({ playlistId, videoIds }: { playlistId: string; videoIds: string[] }) => {
            const { data } = await api.post<{ added: number }>(`/api/playlists/${playlistId}/videos`, { video_ids: videoIds });
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['playlists'] });
        },
    }));
}

export function useRemoveVideoFromPlaylist() {
    const queryClient = useQueryClient();

    return createMutation(() => ({
        mutationFn: async ({ playlistId, videoId }: { playlistId: string; videoId: string }) => {
            const { data } = await api.delete<{ removed: boolean }>(`/api/playlists/${playlistId}/videos/${videoId}`);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['playlists'] });
        },
    }));
}
