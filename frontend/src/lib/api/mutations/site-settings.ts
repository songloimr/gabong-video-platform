import { createMutation, useQueryClient } from '@tanstack/svelte-query';
import { api } from '../client';
import type { SiteSettings } from '$lib/types';
import type { ApiResponse } from '$lib/types';

export interface R2ConnectionResult {
    success: boolean;
    message: string;
    bucketName?: string;
}

export function useUpdateSiteSettings() {
    const queryClient = useQueryClient();

    return createMutation(() => ({
        mutationFn: async (settings: Partial<SiteSettings>) => {
            const { data } = await api.put('/api/admin/settings', { settings });
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'site-settings'] });
            queryClient.invalidateQueries({ queryKey: ['site-settings', 'public'] });
        },
    }));
}

export function useTestR2Connection() {
    return createMutation(() => ({
        mutationFn: async () => {
            const { data } = await api.post<ApiResponse<R2ConnectionResult>>('/api/admin/settings/test-r2');
            return data.data;
        },
    }));
}
