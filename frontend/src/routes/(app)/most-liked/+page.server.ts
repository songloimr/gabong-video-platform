import type { PageServerLoad } from './$types';
import type { Video, PaginatedResponse } from '$lib/types';
import { API_URL } from '$env/static/private';

export const load: PageServerLoad = async ({ url, fetch }) => {

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
        const response = await fetch(`${API_URL}/api/videos?${params.toString()}`);

        if (!response.ok) {
            return {
                ...defaultResponse,
                error: 'errors.loadFailed',
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
            error: 'errors.loadFailed',
        };
    }
};
