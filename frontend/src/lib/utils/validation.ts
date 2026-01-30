import { get } from 'svelte/store';
import { t } from '$lib/stores/i18n';

/**
 * Centralized validation constants for the frontend.
 * Keep in sync with backend validation.
 */

// Title validation
export const TITLE_MIN_LENGTH = 2;
export const TITLE_MAX_LENGTH = 60;

// Description validation
export const DESCRIPTION_MAX_LENGTH = 1300;

// Username validation
export const USERNAME_MIN_LENGTH = 2;
export const USERNAME_MAX_LENGTH = 30;
export const USERNAME_PATTERN = /^[a-z0-9]+$/;

// Password validation
export const PASSWORD_MIN_LENGTH = 6;
export const PASSWORD_MAX_LENGTH = 25;
export const PASSWORD_PATTERN = /^(?=.*[a-zA-Z])(?=.*\d).+$/;

// Search validation
export const SEARCH_MAX_LENGTH = 50;

/**
 * Validates username format
 */
export function validateUsername(username: string): string | null {
    const $t = get(t);
    if (!username) return $t('validation.usernameRequired');
    if (username.length < USERNAME_MIN_LENGTH) return $t('validation.usernameMin', { values: { min: USERNAME_MIN_LENGTH } });
    if (username.length > USERNAME_MAX_LENGTH) return $t('validation.usernameMax', { values: { max: USERNAME_MAX_LENGTH } });
    if (!USERNAME_PATTERN.test(username)) return $t('validation.usernamePattern');
    return null;
}

/**
 * Validates password format
 */
export function validatePassword(password: string): string | null {
    const $t = get(t);
    if (!password) return $t('validation.passwordRequired');
    if (password.length < PASSWORD_MIN_LENGTH) return $t('validation.passwordMin', { values: { min: PASSWORD_MIN_LENGTH } });
    if (password.length > PASSWORD_MAX_LENGTH) return $t('validation.passwordMax', { values: { max: PASSWORD_MAX_LENGTH } });
    if (!PASSWORD_PATTERN.test(password)) return $t('validation.passwordPattern');
    return null;
}

/**
 * Validates title format
 */
export function validateTitle(title: string): string | null {
    const $t = get(t);
    if (!title) return $t('validation.titleRequired');
    if (title.length < TITLE_MIN_LENGTH) return $t('validation.titleMin', { values: { min: TITLE_MIN_LENGTH } });
    if (title.length > TITLE_MAX_LENGTH) return $t('validation.titleMax', { values: { max: TITLE_MAX_LENGTH } });
    return null;
}

/**
 * Validates description length
 */
export function validateDescription(description: string): string | null {
    const $t = get(t);
    if (description && description.length > DESCRIPTION_MAX_LENGTH) {
        return $t('validation.descriptionMax', { values: { max: DESCRIPTION_MAX_LENGTH } });
    }
    return null;
}

/**
 * Validates search query
 */
export function validateSearch(search: string): string | null {
    const $t = get(t);
    if (search && search.length > SEARCH_MAX_LENGTH) {
        return $t('validation.searchMax', { values: { max: SEARCH_MAX_LENGTH } });
    }
    return null;
}

/**
 * Strips HTML tags for plain text length calculation
 */
export function getPlainTextLength(html: string): number {
    if (!html) return 0;
    const temp = document.createElement('div');
    temp.innerHTML = html;
    return temp.textContent?.length || 0;
}
