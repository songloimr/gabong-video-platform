import { createQuery } from '@tanstack/svelte-query';
import { api } from '../client';
import type { PaginatedResponse } from '$lib/types';

export interface Announcement {
    id: string;
    title: string;
    content: string;
    type: 'info' | 'warning' | 'success' | 'error';
    position: 'header_bar' | 'homepage_banner' | 'video_sidebar';
    is_active: boolean;
    start_date: string | null;
    end_date: string | null;
    created_by: string | null;
    created_at: string;
    updated_at: string;
}

export function useActiveAnnouncements(positionGetter?: () => string | undefined) {
    return createQuery(() => ({
        queryKey: ['announcements', 'active', positionGetter?.()],
        queryFn: async () => {
            const position = positionGetter?.();
            const params = position ? { position } : {};
            const { data } = await api.get<Announcement[]>('/api/announcements', { params });
            return data;
        },
        staleTime: 2 * 60 * 1000, // 2 minutes
    }));
}

export function useAdminAnnouncements(paramsGetter: () => { page?: number; limit?: number }) {
    return createQuery(() => {
        const params = paramsGetter();
        return {
            queryKey: ['admin', 'announcements', params],
            queryFn: async () => {
                const { data } = await api.get<PaginatedResponse<Announcement>>('/api/admin/announcements', {
                    params,
                });
                return data;
            },
        };
    });
}

export function useAdminAnnouncement(id: string) {
    return createQuery(() => ({
        queryKey: ['admin', 'announcements', id],
        queryFn: async () => {
            const { data } = await api.get<Announcement>(`/api/admin/announcements/${id}`);
            return data;
        },
        enabled: !!id,
    }));
}
