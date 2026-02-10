import type { PageServerLoad } from './$types';
import type { Video, PaginatedResponse, Category } from '$lib/types';
import { API_URL } from '$env/static/private';

export const load: PageServerLoad = async ({ url, fetch, params }) => {
    const { slug } = params;

    const page = Math.max(1, Math.min(100, Number(url.searchParams.get('page')) || 1));

    // Build query params
    const queryParams = new URLSearchParams();
    queryParams.set('page', page.toString());
    queryParams.set('limit', '25');
    queryParams.set('category', slug);

    const defaultResponse = {
        videos: null as PaginatedResponse<Video> | null,
        category: null as Category | null,
        error: null as string | null,
        currentPage: page,
        slug,
    };

    try {
        // Fetch videos and category info in parallel
        const [videosResponse, categoryResponse] = await Promise.all([
            fetch(`${API_URL}/api/videos?${queryParams.toString()}`),
            fetch(`${API_URL}/api/categories/${slug}`),
        ]);

        if (!videosResponse.ok) {
            return {
                ...defaultResponse,
                error: 'errors.loadFailed',
            };
        }

        const videosData: PaginatedResponse<Video> = await videosResponse.json();

        let categoryData: Category | null = null;
        if (categoryResponse.ok) {
            categoryData = await categoryResponse.json();
        }

        return {
            ...defaultResponse,
            videos: videosData,
            category: categoryData,
        };
    } catch (error) {
        console.error('Failed to fetch category videos:', error);
        return {
            ...defaultResponse,
            error: 'errors.loadFailed',
        };
    }
};
