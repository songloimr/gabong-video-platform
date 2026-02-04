import { PUBLIC_VITE_API_URL } from "$env/static/public"
import type { Category, PaginatedResponse } from "$lib/types"
import type { PageServerLoad } from "./$types"

export const load: PageServerLoad = async ({ fetch }) => {
    const apiUrl = PUBLIC_VITE_API_URL
    let categories = [] as Category[]

    const response = await fetch(`${apiUrl}/categories`);

    if (response.ok) {
        const { data }: PaginatedResponse<Category> = await response.json();
        categories = data || [];

        console.info(categories)
    }

    return {
        categories
    }
}