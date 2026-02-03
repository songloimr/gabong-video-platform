// Site branding - now dynamic via site-settings store
// Use: import { siteSettings } from '$lib/stores/site-settings.svelte';

export const MAX_UPLOAD_FILES = 5;
export const MAX_UPLOAD_SIZE = 500 * 1024 * 1024; // 500MB
export const MAX_VIDEO_DURATION = 15 * 60; // 15 minutes

export const VIDEO_SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'views', label: 'Most Viewed' },
  { value: 'likes', label: 'Most Liked' },
];

export const COMMENT_SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
];

export const USER_STATUS = {
  ACTIVE: 'active',
  SUSPENDED: 'suspended',
  BANNED: 'banned',
} as const;

export const VIDEO_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  HIDDEN: 'hidden',
} as const;

export const BANNER_POSITIONS = [
  'header_top',
  'header_bottom',
  'sidebar_top',
  'content_top',
] as const;

export const POLLING_INTERVAL = 30000; // 30 seconds
export const NOTIFICATION_POLLING_INTERVAL = 30000;
