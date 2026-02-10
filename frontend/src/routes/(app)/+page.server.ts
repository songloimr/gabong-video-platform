import type { PageServerLoad } from './$types';
import type { Video, Category, PaginatedResponse, ApiResponse } from '$lib/types';
import { API_URL } from '$env/static/private';

export const load: PageServerLoad = async ({ url, fetch }) => {

    const page = Math.max(1, Math.min(100, Number(url.searchParams.get('page')) || 1));
    const duration = url.searchParams.get('duration') || 'all';
    const year = url.searchParams.get('year') || 'all';
    const category = url.searchParams.get('category') || 'all';

    const params = new URLSearchParams();
    params.set('page', page.toString());
    params.set('limit', '24');
    params.set('sort', 'newest');

    if (duration !== 'all') {
        params.set('duration', duration);
    }
    if (year !== 'all') {
        params.set('year', year);
    }
    if (category !== 'all') {
        params.set('category', category);
    }

    const defaultResponse = {
        videos: null as PaginatedResponse<Video> | null,
        categories: [] as Category[],
        featuredVideos: [] as Video[],
        error: null as string | null,
        currentPage: page,
        duration,
        year,
        category,
    };

    try {
        const [videosResponse, categoriesResponse, featuredResponse] = await Promise.all([
            fetch(`${API_URL}/api/videos?${params.toString()}`),
            fetch(`${API_URL}/api/categories`),
            fetch(`${API_URL}/api/videos/featured?limit=4`),
        ]);

        const videos: PaginatedResponse<Video> = videosResponse.ok ? await videosResponse.json() : null;
        const { data: categories }: ApiResponse<Category[]> = categoriesResponse.ok ? await categoriesResponse.json() : [];
        const { data: featuredVideos }: ApiResponse<Video[]> = featuredResponse.ok ? await featuredResponse.json() : [];

        return {
            ...defaultResponse,
            videos,
            categories,
            featuredVideos,
        };
    } catch (error) {
        console.error('Failed to fetch data:', error);
        return {
            ...defaultResponse,
            error: 'errors.loadFailed',
        };
    }
};
