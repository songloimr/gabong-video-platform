import { browser } from "$app/environment"
import { locale, waitLocale, getLocaleFromNavigator } from 'svelte-i18n'
import type { LayoutLoad } from "./$types"

export const ssr = true

export const load: LayoutLoad = async ({ data }) => {
    if (browser) {
        locale.set(getLocaleFromNavigator())
    }
    await waitLocale()

    return data
}