import { browser } from '$app/environment';
import { init, register, getLocaleFromNavigator } from 'svelte-i18n';

const defaultLocale = 'vi';

register('vi', () => import('./vi.json'));
register('en', () => import('./en.json'));

init({
  fallbackLocale: defaultLocale,
  initialLocale: browser ? (localStorage.getItem('locale') || getLocaleFromNavigator() || defaultLocale) : defaultLocale,
});
