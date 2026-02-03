import type { HandleFetch, Handle } from "@sveltejs/kit";
import { locale } from 'svelte-i18n'

export const handle: Handle = async ({ event, resolve }) => {
    const acceptLanguage = event.request.headers.get('accept-language')

    const [lang] = acceptLanguage?.split(',') || ['en-US']

    if (lang) {
        locale.set(lang)
    }

    return resolve(event)
}

export const handleFetch: HandleFetch = async ({ event, fetch, request }) => {
    request.headers.set("ssr", "true")
    return fetch(request)
}