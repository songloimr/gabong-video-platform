import { createQuery } from '@tanstack/svelte-query';
import { api } from '../client';
import type { User } from '$lib/types';

export const authKeys = {
	all: ['auth'] as const,
	profile: () => [...authKeys.all, 'profile'] as const,
	session: () => [...authKeys.all, 'session'] as const,
};

/**
 * Query to get the current user's profile
 */
export function useProfile() {
	return createQuery(() => ({
		queryKey: authKeys.profile(),
		queryFn: async () => {
			const { data } = await api.get<{ data: User }>('/api/profile');
			return data.data;
		},
		retry: false,
		staleTime: 1000 * 60 * 5, // 5 minutes
	}));
}

/**
 * Query to validate the current session
 */
export function useSession() {
	return createQuery(() => ({
		queryKey: authKeys.session(),
		queryFn: async () => {
			const { data } = await api.get<{ valid: boolean }>('/api/auth/session');
			return data.valid;
		},
		retry: false,
		staleTime: 1000 * 60, // 1 minute
	}));
}
