import type { PageServerLoad } from './$types';
import type { Playlist, PaginatedResponse } from '$lib/types';
import { API_URL } from '$env/static/private';

export const load: PageServerLoad = async ({ url, fetch }) => {

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
        const response = await fetch(`${API_URL}/api/playlists?${params.toString()}`);

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
