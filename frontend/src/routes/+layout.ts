import '$lib/i18n';
import { waitLocale } from 'svelte-i18n';
import { auth } from '$lib/stores/auth.svelte';
import { browser } from '$app/environment';
import type { LayoutLoad } from './$types';

export const ssr = false;
export const prerender = false;

export const load: LayoutLoad = async () => {
	// Wait for i18n to be ready
	await waitLocale();

	// Load auth on the client
	if (browser) {
		auth.loadAuth();
	}

	return {};
};
