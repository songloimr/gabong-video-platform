import { createQuery } from '@tanstack/svelte-query';
import { api } from '../client';
import type { ApiResponse, SiteSettings } from '$lib/types';

export function usePublicSiteSettings() {
    return createQuery(() => ({
        queryKey: ['site-settings', 'public'],
        queryFn: async () => {
            const { data } = await api.get<SiteSettings>('/api/site-settings/public');
            return data;
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
    }));
}

export function useAdminSiteSettings() {
    return createQuery(() => ({
        queryKey: ['admin', 'site-settings'],
        queryFn: async () => {
            const { data } = await api.get<ApiResponse<SiteSettings>>('/api/admin/settings');
            return data.data;
        },
    }));
}
