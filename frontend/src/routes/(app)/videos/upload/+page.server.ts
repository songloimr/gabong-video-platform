import type { PageServerLoad } from "./$types";
import type { Category, ApiResponse } from '$lib/types';
import { API_URL } from "$env/static/private";

export const load: PageServerLoad = async ({ fetch }) => {
    const baseResponse = {
        categories: [] as Category[]
    }
    try {
        const [categoriesResponse] = await Promise.all([
            fetch(`${API_URL}/api/categories`),
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