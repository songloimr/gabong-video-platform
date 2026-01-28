import { createMutation, useQueryClient } from '@tanstack/svelte-query';
import { api } from '../client';
import type { Announcement } from '../queries/announcements';


export interface CreateAnnouncementInput {
    title: string;
    content: string;
    type?: 'info' | 'warning' | 'success' | 'error';
    is_active?: boolean;
    start_date?: string;
    end_date?: string;
}

export interface UpdateAnnouncementInput extends Partial<CreateAnnouncementInput> { }

export function useCreateAnnouncement() {
    const queryClient = useQueryClient();

    return createMutation(() => ({
        mutationFn: async (input: CreateAnnouncementInput) => {
            const { data } = await api.post<Announcement>('/api/admin/announcements', input);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'announcements'] });
            queryClient.invalidateQueries({ queryKey: ['announcements', 'active'] });
        },
    }));
}

export function useUpdateAnnouncement() {
    const queryClient = useQueryClient();

    return createMutation(() => ({
        mutationFn: async ({ id, ...input }: UpdateAnnouncementInput & { id: string }) => {
            const { data } = await api.put<Announcement>(`/api/admin/announcements/${id}`, input);
            return data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'announcements'] });
            queryClient.invalidateQueries({ queryKey: ['admin', 'announcements', variables.id] });
            queryClient.invalidateQueries({ queryKey: ['announcements', 'active'] });
        },
    }));
}

export function useDeleteAnnouncement() {
    const queryClient = useQueryClient();

    return createMutation(() => ({
        mutationFn: async (id: string) => {
            await api.delete(`/api/admin/announcements/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'announcements'] });
            queryClient.invalidateQueries({ queryKey: ['announcements', 'active'] });
        },
    }));
}
