import { createMutation } from '@tanstack/svelte-query';
import { api } from '../client';
import type { Category } from '$lib/types';

export function useCreateCategory() {
	return createMutation(() => ({
		mutationFn: async (payload: { name: string; slug: string; thumbnail_url?: string }) => {
			const { data } = await api.post<{ data: Category }>('/api/categories', payload);
			return data.data;
		},
	}));
}

export function useUpdateCategory() {
	return createMutation(() => ({
		mutationFn: async ({ id, payload }: { id: string; payload: { name: string; slug: string; thumbnail_url?: string } }) => {
			const { data } = await api.put<{ data: Category }>(`/api/categories/${id}`, payload);
			return data.data;
		},
	}));
}

export function useDeleteCategory() {
	return createMutation(() => ({
		mutationFn: async (id: string) => {
			await api.delete(`/api/categories/${id}`);
		},
	}));
}
