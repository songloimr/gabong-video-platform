import '$lib/i18n';
import { auth } from '$lib/stores/auth.svelte';
import { browser } from '$app/environment';
import type { LayoutLoad } from './$types';


export const load: LayoutLoad = async () => {
	// Load auth on the client
	if (browser) {
		auth.loadAuth();
	}
};
