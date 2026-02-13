import { API_URL } from "$env/static/private"
import type { Category, PaginatedResponse } from "$lib/types"
import type { PageServerLoad } from "./$types"

export const load: PageServerLoad = async ({ fetch }) => {
    let categories = [] as Category[]

    const response = await fetch(`${API_URL}/api/categories`);

    if (response.ok) {
        const { data }: PaginatedResponse<Category> = await response.json();
        categories = data || [];
    }

    return {
        categories
    }
}