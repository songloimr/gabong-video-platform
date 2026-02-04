export interface User {
  id: string;
  username: string;
  email: string | null;
  role: 'user' | 'admin';
  avatar_url: string | null;
  bio: string | null;
  status: 'active' | 'suspended' | 'banned';
  created_at: string;
  last_ip?: string | null;
}

export interface VideoMarkup {
  id: string;
  time: number;
  text: string;
  width: string;
  video_id?: string;
  sort_order?: number;
  created_at?: string;
  updated_at?: string;
}

export interface VideoSubtitle {
  id: string;
  label: string;
  language_code: string;
  video_id?: string;
  vtt_content?: string;
  sort_order?: number;
  created_at?: string;
  updated_at?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  sort_order?: number;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  usage_count: number;
}

export interface Video {
  id: string;
  title: string;
  slug: string;
  short_code: string;
  description: string | null;
  video_url: string | null;
  embed_url: string | null;
  embed_platform: string | null;
  thumbnail_url: string | null;
  storyboard_url: string | null;
  duration: number | null;
  file_size: number | null;
  likes_count: number;
  comments_count: number;
  is_pinned: boolean;
  published_at: string | null;
  user?: {
    id: string;
    username: string;
    avatar_url: string | null;
  };
  category?: {
    id: string;
    name: string;
    slug: string;
  };
  tags?: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
  status: VideoStatus;
  video_key?: string | null;
  local_path?: string | null;
  resolution?: string | null;
}

export type VideoStatus = 'pending_approval' | 'pending_processing' | 'processing' | 'approved' | 'rejected' | 'hidden';

export interface Comment {
  id: string;
  video_id: string;
  user_id: string | null;
  parent_id: string | null;
  content: string;
  is_hidden: boolean;
  hidden_by: string | null;
  hidden_at: string | null;
  created_at: string;
  updated_at: string;
  user?: {
    id: string;
    username: string;
    avatar_url: string | null;
  };
  replies_count?: number;
}

export interface Playlist {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  thumbnail_url: string | null;
  is_public: boolean;
  video_count: number;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface PlaylistVideo {
  position: number;
  added_at: string;
}

export interface WatchLater {
  id: string;
  title: string;
  slug: string;
  short_code: string;
  thumbnail_url: string | null;
  duration: number | null;
  likes_count: number;
  published_at: string | null;
  // Watch later specific fields
  watch_position: number | null;
  added_at: string;
}

export interface Notification {
  id: string;
  type: 'video_approved' | 'video_rejected' | 'comment_reply' | 'system';
  title: string;
  message: string | null;
  link: string | null;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
}

export interface BannerAd {
  id: string;
  name: string;
  content: string;
  link_url: string | null;
  position: string;
  is_active: boolean;
  impressions: number;
  clicks: number;
  created_at: string;
  updated_at: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
  total: number;
  has_more: boolean;
}

export interface VideoListParams {
  page?: number;
  limit?: number;
  category?: string;
  tag?: string;
  sort?: 'newest' | 'views' | 'likes';
  search?: string;
  duration?: 'short' | 'medium' | 'long';
  year?: number;
  favorites?: boolean;
}

export interface SiteSettings {
    // Branding settings
    site_name: string;
    site_tagline?: string;
    site_url: string;
    // General settings
    age_verification_enabled?: boolean;
    google_analytics_code?: string;
    custom_head_html?: string;
    custom_body_html?: string;
    max_upload_size_mb: number;
    max_video_duration: number;
    max_files_per_upload?: number;
    allowed_video_formats: string[];
    r2_account_id?: string;
    r2_access_key_id?: string;
    r2_secret_access_key?: string;
    r2_bucket?: string;
    ffmpeg_path?: string;
    ffmpeg_max_processes?: number;
    ffmpeg_preset?: string;
    // Rate Limit & Restrictions
    cache_ttl_minutes?: number;
    global_rate_limit_requests?: number;
    global_rate_limit_seconds?: number;
    new_account_wait_hours?: number;
    daily_upload_limit?: number;
    comment_cooldown_seconds?: number;
    comment_daily_limit?: number;
    // Legal settings
    contact_email?: string;
    terms_updated_at?: string;
    privacy_updated_at?: string;
    cookies_updated_at?: string;
}

export type AuthResponse = ApiResponse<{
  user: User;
  access_token: string;
  refresh_token: string;
}>

export interface ApiResponse<T> {
  data: T;
}

export interface ApiError {
  status_code: number;
  message: string | string[];
  error: string;
}

export interface DashboardStatsResponse {
  total_users: number;
  total_videos: number;
  pending_approval_videos: number;
  pending_processing_videos: number;
  processing_videos: number;
  total_views: number;
  total_comments: number;
  today_uploads: number;
  today_registrations: number;
}

export type FeedbackType = 'bug' | 'suggestion' | 'other';

export interface Feedback {
  id: string;
  type: FeedbackType;
  title: string;
  content: string;
  user_id: string | null;
  ip_address: string | null;
  created_at: string;
  user?: {
    id: string;
    username: string;
    avatar_url: string | null;
  } | null;
}

export interface CreateFeedbackDto {
  type: FeedbackType;
  title: string;
  content: string;
}
