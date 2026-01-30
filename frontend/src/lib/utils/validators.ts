import { get } from 'svelte/store';
import { t } from '$lib/stores/i18n';

export function validateUsername(username: string): boolean {
  return /^[a-zA-Z0-9_]{3,50}$/.test(username);
}

export function validatePassword(password: string): boolean {
  return password.length >= 8;
}

export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validateFileSize(size: number, maxSize: number = 500 * 1024 * 1024): boolean {
  return size <= maxSize;
}

export function validateVideoFile(file: File): { valid: boolean; error?: string } {
  const $t = get(t);
  if (!file.type.startsWith('video/')) {
    return { valid: false, error: $t('validation.fileMustBeVideo') };
  }
  if (!validateFileSize(file.size)) {
    return { valid: false, error: $t('validation.fileTooLarge', { values: { limit: '500MB' } }) };
  }
  return { valid: true };
}

export function validateSlug(slug: string): boolean {
  return /^[a-z0-9-]+$/.test(slug);
}
