/**
 * Authentication-related constants
 */
export const AUTH_CONSTANTS = {
  BCRYPT_SALT_ROUNDS: 10,
  PASSWORD_MIN_LENGTH: 8,
} as const;

/**
 * Upload-related constants
 */
export const UPLOAD_CONSTANTS = {
  ALLOWED_MIME_TYPES: [
    'video/mp4',
    'video/webm',
    'video/quicktime',
    'video/x-msvideo',
    'video/x-matroska',
  ],
  MAX_FILE_SIZE_BYTES: 500 * 1024 * 1024, // 500MB
  MAX_FILES_PER_UPLOAD: 5,
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  MAX_IMAGE_SIZE_BYTES: 5 * 1024 * 1024, // 5MB
} as const;

/**
 * Pagination-related constants
 */
export const PAGINATION_CONSTANTS = {
  STATUSES: ['pending_approval', 'pending_processing', 'processing', 'approved', 'rejected'] as const,
  SORT_OPTIONS: ['newest', 'oldest', 'popular', 'views'] as const,
} as const;

/**
 * User-related constants
 */
export const USER_CONSTANTS = {
  ROLES: ['user', 'admin'] as const,
  STATUSES: ['active', 'suspended', 'banned'] as const,
} as const;
