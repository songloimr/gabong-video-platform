import type { PageServerLoad } from './$types';
import type { Video, PaginatedResponse } from '$lib/types';
import { PUBLIC_VITE_API_URL } from '$env/static/public';

// Validation constants (keep in sync with backend)
const SEARCH_MAX_LENGTH = 50;

// Basic security pattern to detect malicious input
const SECURITY_PATTERN = /('|"|--|;|\/\*|\*\/|union\s+select|drop\s+table|<script|javascript:)/i;

export const load: PageServerLoad = async ({ url, fetch }) => {
    const apiUrl = PUBLIC_VITE_API_URL

    // Get and validate search query
    let q = url.searchParams.get('q') || '';

    // Truncate to max length
    q = q.substring(0, SEARCH_MAX_LENGTH).trim();

    // Security check - reject suspicious patterns
    if (SECURITY_PATTERN.test(q)) {
        q = ''; // Clear suspicious queries
    }

    const page = Math.max(1, Math.min(100, Number(url.searchParams.get('page')) || 1));
    const sort = ['newest', 'views', 'likes'].includes(url.searchParams.get('sort') || '')
        ? url.searchParams.get('sort')
        : 'newest';

    // Build query params
    const params = new URLSearchParams();
    params.set('page', page.toString());
    params.set('limit', '25');
    params.set('sort', sort!);
    if (q) params.set('search', q);

    const defaultResponse = {
        videos: null,
        error: null,
        searchQuery: q,
        currentPage: page,
        sort,
    };

    try {
        const response = await fetch(`${apiUrl}/api/videos?${params.toString()}`);

        if (!response.ok) {
            return {
                ...defaultResponse,
                error: 'Failed to load search results',
            };
        }

        const data: PaginatedResponse<Video> = await response.json();

        return {
            ...defaultResponse,
            videos: data,
        };
    } catch (error) {
        console.error('Failed to fetch search results:', error);
        return {
            ...defaultResponse,
            error: 'Failed to load search results',
        };
    }
};
