import type { PageServerLoad } from './$types';
import type { Playlist, PaginatedResponse } from '$lib/types';
import { PUBLIC_VITE_API_URL } from '$env/static/public';

export const load: PageServerLoad = async ({ url, fetch }) => {
    const apiUrl = PUBLIC_VITE_API_URL;

    const page = Math.max(1, Math.min(100, Number(url.searchParams.get('page')) || 1));

    // Build query params
    const params = new URLSearchParams();
    params.set('page', page.toString());
    params.set('limit', '25');

    const defaultResponse = {
        playlists: null as PaginatedResponse<Playlist> | null,
        error: null as string | null,
        currentPage: page,
    };

    try {
        const response = await fetch(`${apiUrl}/api/playlists?${params.toString()}`);

        if (!response.ok) {
            return {
                ...defaultResponse,
                error: 'errors.loadFailed',
            };
        }

        const data: PaginatedResponse<Playlist> = await response.json();

        return {
            ...defaultResponse,
            playlists: data,
        };
    } catch (error) {
        console.error('Failed to fetch playlists:', error);
        return {
            ...defaultResponse,
            error: 'errors.loadFailed',
        };
    }
};
