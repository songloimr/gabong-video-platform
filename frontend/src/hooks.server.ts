import type { HandleFetch } from "@sveltejs/kit";

export const handleFetch: HandleFetch = async ({ event, fetch, request }) => {
    request.headers.set("ssr", "true")
    return fetch(request)
}