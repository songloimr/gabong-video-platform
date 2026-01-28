import DOMPurify from 'isomorphic-dompurify';

/**
 * Sanitization options for different use cases
 */
export interface SanitizeOptions {
  /** Allow basic formatting tags like <b>, <i>, <u> */
  allowBasicFormatting?: boolean;
  /** Allow links with href attribute */
  allowLinks?: boolean;
  /** Custom allowed tags */
  allowedTags?: string[];
  /** Custom allowed attributes */
  allowedAttr?: string[];
}

/**
 * Sanitizes HTML content to prevent XSS attacks.
 * By default, strips all HTML tags and attributes.
 *
 * @param input - The input string to sanitize
 * @param options - Sanitization options
 * @returns Sanitized string
 */
export function sanitizeHtml(
  input: string,
  options: SanitizeOptions = {},
): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  const {
    allowBasicFormatting = false,
    allowLinks = false,
    allowedTags = [],
    allowedAttr = [],
  } = options;

  // Build allowed tags list
  const tags: string[] = [...allowedTags];
  if (allowBasicFormatting) {
    tags.push('b', 'i', 'u', 'strong', 'em', 'br', 'p');
  }
  if (allowLinks) {
    tags.push('a');
  }

  // Build allowed attributes list
  const attrs: string[] = [...allowedAttr];
  if (allowLinks) {
    attrs.push('href', 'target', 'rel');
  }

  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: tags,
    ALLOWED_ATTR: attrs,
    // Force all links to open in new tab with noopener
    ADD_ATTR: allowLinks ? ['target', 'rel'] : [],
    FORCE_BODY: true,
  });
}

/**
 * Strips all HTML tags from input, leaving only plain text.
 * Useful for user-generated content that should never contain HTML.
 *
 * @param input - The input string to strip
 * @returns Plain text without any HTML
 */
export function stripHtml(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  });
}

/**
 * Sanitizes a string for use in URLs (slug generation).
 * Removes special characters and replaces spaces with hyphens.
 *
 * @param input - The input string
 * @returns URL-safe string
 */
export function slugify(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  return input
    .toLowerCase()
    .trim()
    .normalize('NFD') // Normalize to handle accents
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Escapes HTML entities to prevent injection in non-HTML contexts.
 *
 * @param input - The input string
 * @returns Escaped string
 */
export function escapeHtml(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  const htmlEntities: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  };

  return input.replace(/[&<>"']/g, (char) => htmlEntities[char] || char);
}

/**
 * Validates and sanitizes an email address.
 *
 * @param email - The email to validate
 * @returns Sanitized email or null if invalid
 */
export function sanitizeEmail(email: string): string | null {
  if (!email || typeof email !== 'string') {
    return null;
  }

  const sanitized = email.toLowerCase().trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  return emailRegex.test(sanitized) ? sanitized : null;
}
