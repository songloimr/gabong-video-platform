import { writable, derived } from 'svelte/store';
import { locale, t, _, locales } from 'svelte-i18n';
import { browser } from '$app/environment';

export type Locale = 'vi' | 'en';

export const availableLocales: Locale[] = ['vi', 'en'];

export const localeNames: Record<Locale, string> = {
	vi: 'Tiếng Việt',
	en: 'English'
};

// Create a writable store for the current locale that syncs with svelte-i18n
export const currentLocale = writable<Locale>('vi');

// Subscribe to svelte-i18n's locale changes
locale.subscribe(value => {
	if (value && (value === 'vi' || value === 'en')) {
		currentLocale.set(value as Locale);
	}
});

// Sync currentLocale changes back to svelte-i18n's locale
currentLocale.subscribe(value => {
	locale.set(value);
	if (browser) {
		localStorage.setItem('locale', value);
	}
});

// Helper function to change locale
export function setLocale(newLocale: Locale) {
	currentLocale.set(newLocale);
}

// Export the translation function for convenience
export { t, _, locale, locales };

// Get locale display name
export const localeDisplayName = derived(currentLocale, ($currentLocale) => {
	return localeNames[$currentLocale];
});

// Check if current locale is RTL (for future expansion)
export const isRTL = derived(currentLocale, ($currentLocale) => {
	return false; // Neither Vietnamese nor English are RTL
});
