import type { PageServerLoad } from './$types';
import type { Video, PaginatedResponse } from '$lib/types';
import { PUBLIC_VITE_API_URL } from '$env/static/public';

export const load: PageServerLoad = async ({ url, fetch }) => {
    const apiUrl = PUBLIC_VITE_API_URL;

    const page = Math.max(1, Math.min(100, Number(url.searchParams.get('page')) || 1));

    // Build query params
    const params = new URLSearchParams();
    params.set('page', page.toString());
    params.set('limit', '25');
    params.set('sort', 'likes');

    const defaultResponse = {
        videos: null as PaginatedResponse<Video> | null,
        error: null as string | null,
        currentPage: page,
    };

    try {
        const response = await fetch(`${apiUrl}/api/videos?${params.toString()}`);

        if (!response.ok) {
            return {
                ...defaultResponse,
                error: 'Failed to load videos',
            };
        }

        const data: PaginatedResponse<Video> = await response.json();

        return {
            ...defaultResponse,
            videos: data,
        };
    } catch (error) {
        console.error('Failed to fetch videos:', error);
        return {
            ...defaultResponse,
            error: 'Failed to load videos',
        };
    }
};
