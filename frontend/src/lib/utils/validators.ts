import { get } from 'svelte/store';
import { t } from '$lib/stores/i18n';
import { USERNAME_MIN_LENGTH, USERNAME_MAX_LENGTH, USERNAME_PATTERN } from './validation';

export function validateUsername(username: string): string | null {
    const $t = get(t);
    if (!username) return $t('validation.usernameRequired');
    if (username.length < USERNAME_MIN_LENGTH) return $t('validation.usernameMin', { values: { min: USERNAME_MIN_LENGTH } });
    if (username.length > USERNAME_MAX_LENGTH) return $t('validation.usernameMax', { values: { max: USERNAME_MAX_LENGTH } });
    if (!USERNAME_PATTERN.test(username)) return $t('validation.usernamePattern');
    return null;
}

export function validatePassword(password: string): string | null {
    const $t = get(t);
    if (!password) return $t('validation.passwordRequired');
    if (password.length < 6) return $t('validation.passwordMin', { values: { min: 6 } });
    if (password.length > 25) return $t('validation.passwordMax', { values: { max: 25 } });
    if (!/^(?=.*[a-zA-Z])(?=.*\d).+$/.test(password)) return $t('validation.passwordPattern');
    return null;
}

export function validateTitle(title: string): string | null {
    const $t = get(t);
    if (!title) return $t('validation.titleRequired');
    if (title.length < 2) return $t('validation.titleMin', { values: { min: 2 } });
    if (title.length > 60) return $t('validation.titleMax', { values: { max: 60 } });
    return null;
}

export function validateSlug(slug: string): string | null {
    const $t = get(t);
    if (!slug) return $t('validation.slugRequired');
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return $t('validation.slugPattern');
    if (slug.length > 200) return $t('validation.slugMax', { values: { max: 200 } });
    return null;
}
