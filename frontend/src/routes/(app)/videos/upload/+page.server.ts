import { PUBLIC_VITE_API_URL } from "$env/static/public";
import type { PageServerLoad } from "./$types";
import type { Category, ApiResponse } from '$lib/types';

export const load: PageServerLoad = async ({ params, fetch }) => {
    const baseResponse = {
        categories: [] as Category[],
        // settings: {} as SiteSettings,
    }
    try {
        const [categoriesResponse] = await Promise.all([
            fetch(`${PUBLIC_VITE_API_URL}/api/categories`),
        ])

        if (categoriesResponse.ok) {
            const { data }: ApiResponse<Category[]> = await categoriesResponse.json()
            baseResponse.categories = data
        }

        return baseResponse
    } catch (error) {
        console.error('Error loading upload page:', error);
        return baseResponse
    }
}