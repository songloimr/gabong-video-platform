/**
 * Centralized validation constants for the application.
 * These values should be kept in sync with frontend validation.
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
export const USERNAME_PATTERN_MESSAGE = 'Username can only contain lowercase letters (a-z) and numbers (0-9)';

// Password validation
export const PASSWORD_MIN_LENGTH = 6;
export const PASSWORD_MAX_LENGTH = 25;
export const PASSWORD_PATTERN = /^(?=.*[a-zA-Z])(?=.*\d).+$/;
export const PASSWORD_PATTERN_MESSAGE = 'Password must contain at least 1 letter and 1 number';

// Search validation
export const SEARCH_MAX_LENGTH = 50;

// Security patterns for detecting malicious input
export const SECURITY_PATTERNS = {
    // SQL injection patterns
    SQL_INJECTION: /('|"|--|;|\/\*|\*\/|xp_|sp_|0x|union\s+select|drop\s+table|insert\s+into|delete\s+from|update\s+.*\s+set)/i,

    // Path traversal patterns
    PATH_TRAVERSAL: /(\.\.[\/\\]|%2e%2e[\/\\%]|%252e%252e)/i,

    // XSS patterns (basic)
    XSS_BASIC: /(<script|javascript:|on\w+\s*=|<iframe|<object|<embed|<link|<meta)/i,

    // Command injection patterns
    COMMAND_INJECTION: /(\||;|`|\$\(|&&|\|\||>|<)/,

    // Null byte injection
    NULL_BYTE: /%00|\\0/,
};

// Slug validation (for URL-safe identifiers)
export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const SLUG_MAX_LENGTH = 200;

// UUID pattern
export const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Short code pattern (for video short codes)
export const SHORT_CODE_PATTERN = /^[a-zA-Z0-9]{6,12}$/;

/**
 * Validates a string against security patterns.
 * Returns true if the input is safe, false if it contains suspicious patterns.
 */
export function isSecureInput(input: string): boolean {
    if (!input || typeof input !== 'string') {
        return true; // Empty values are handled by other validators
    }

    return !Object.values(SECURITY_PATTERNS).some(pattern => pattern.test(input));
}

/**
 * Sanitizes a slug to ensure it's URL-safe.
 */
export function sanitizeSlug(input: string): string {
    if (!input || typeof input !== 'string') {
        return '';
    }

    return input
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9-]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
        .substring(0, SLUG_MAX_LENGTH);
}

/**
 * Validates that a param is a valid UUID or slug.
 */
export function isValidIdentifier(input: string): boolean {
    if (!input || typeof input !== 'string') {
        return false;
    }

    // Check for security issues first
    if (!isSecureInput(input)) {
        return false;
    }

    // Must be either a valid UUID or a valid slug
    return UUID_PATTERN.test(input) || SLUG_PATTERN.test(input) || SHORT_CODE_PATTERN.test(input);
}
