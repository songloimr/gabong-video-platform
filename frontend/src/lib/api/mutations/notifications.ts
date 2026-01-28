import { createMutation, useQueryClient } from '@tanstack/svelte-query';
import { api } from '../client';

export function useMarkAsRead() {
    const queryClient = useQueryClient();

    return createMutation(() => ({
        mutationFn: async (notificationId: string) => {
            await api.put(`/api/notifications/${notificationId}/read`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
            queryClient.invalidateQueries({ queryKey: ['notifications', 'count'] });
        },
    }));
}

export function useMarkAllAsRead() {
    const queryClient = useQueryClient();

    return createMutation(() => ({
        mutationFn: async () => {
            await api.put('/api/notifications/read-all');
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
            queryClient.invalidateQueries({ queryKey: ['notifications', 'count'] });
        },
    }));
}

export function useDeleteNotification() {
    const queryClient = useQueryClient();

    return createMutation(() => ({
        mutationFn: async (notificationId: string) => {
            await api.delete(`/api/notifications/${notificationId}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
            queryClient.invalidateQueries({ queryKey: ['notifications', 'count'] });
        },
    }));
}
