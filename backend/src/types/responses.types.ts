// ============================================
// Base Entity Response Types
// ============================================

import { VideoStatus } from "./video.types";

export interface UserResponse {
    id: string;
    username: string;
    email: string | null;
    role: 'user' | 'admin';
    avatar_url: string | null;
    bio?: string | null;
    status?: 'active' | 'suspended' | 'banned';
    created_at: Date;
}

export interface UserPublicResponse {
    id: string;
    username: string;
    avatar_url: string | null;
}

export interface UserProfileResponse {
    id: string;
    username: string;
    avatar_url: string | null;
    bio: string | null;
    created_at: Date;
}

export interface CategoryResponse {
    id: string;
    name: string;
    slug: string;
    thumbnail_url?: string | null;
    video_count?: number;
    sort_order?: number;
}

export interface TagResponse {
    id: string;
    name: string;
    slug: string;
    usage_count?: number;
}

// ============================================
// Video Related Response Types
// ============================================

export interface VideoListItemResponse {
    id: string;
    title: string;
    slug: string;
    short_code: string;
    thumbnail_url: string | null;
    duration: number | null;
    likes_count: number;
    published_at: Date | null;
    is_pinned: boolean;
    user?: UserPublicResponse | null;
    category?: CategoryResponse | null;
}

export interface VideoDetailResponse {
    id: string;
    title: string;
    slug: string;
    short_code: string;
    description: string | null;
    source_type: 'upload' | 'embed';
    video_url: string | null;
    video_key: string | null;
    embed_url: string | null;
    embed_platform: string | null;
    thumbnail_url: string | null;
    storyboard_url: string | null;
    duration: number | null;
    resolution: string | null;
    likes_count: number;
    comments_count: number;
    published_at: Date | null;
    tags?: TagResponse[];
    user: UserPublicResponse | null;
    category: CategoryResponse | null;
    watch_position: number;
    status: VideoStatus;
    is_pinned: boolean;
}

export interface VideoCreateResponse {
    id: string;
    short_code: string;
    slug: string;
}

export interface VideoAdminResponse {
    id: string;
    title: string;
    slug: string;
    short_code: string;
    description: string | null;
    source_type: 'upload' | 'embed';
    video_url: string | null;
    embed_url: string | null;
    embed_platform: string | null;
    thumbnail_url: string | null;
    storyboard_url: string | null;
    duration: number | null;
    resolution: string | null;
    file_size: number | null;
    views: number;
    likes_count: number;
    comments_count: number;
    status: VideoStatus;
    rejection_reason: string | null;
    local_path: string | null;
    approved_at: Date | null;
    user_id: string | null;
    category_id: string | null;
    user?: UserPublicResponse | null;
    category?: CategoryResponse | null;
    published_at: Date | null;
    is_pinned: boolean;
    pinned_at: Date | null;
    created_at: Date;
    updated_at: Date;
    custom_upload_date: Date | null;
}


export interface LikeResponse {
    is_liked: boolean;
    likes_count: number;
}

// ============================================
// Comment Response Types
// ============================================

export interface CommentResponse {
    id: string;
    video_id: string;
    parent_id: string | null;
    content: string;
    is_hidden: boolean;
    hidden_by: string | null;
    hidden_at: Date | null;
    created_at: Date;
    updated_at: Date;
    user?: UserPublicResponse | null;
    replies_count?: number;
}

export interface CommentsListResponse {
    data: CommentResponse[];
    total: number;
    has_more: boolean;
}

// ============================================
// Watch Later Response Types
// ============================================

export interface WatchLaterItemResponse {
    id: string;
    title: string;
    slug: string;
    short_code: string;
    thumbnail_url: string | null;
    duration: number | null;
    likes_count: number;
    published_at: Date | null;
    watch_position: number;
    added_at: Date;
}

// ============================================
// Auth Response Types
// ============================================

export interface AuthResponse {
    user: UserResponse;
    access_token: string;
    refresh_token: string;
}

export interface TokensResponse {
    access_token: string;
    refresh_token: string;
}

// ============================================
// User Admin Response Types
// ============================================

export interface UserAdminListItemResponse {
    id: string;
    username: string;
    email: string | null;
    role: 'user' | 'admin';
    status: 'active' | 'suspended' | 'banned';
    avatar_url: string | null;
    created_at: Date;
}

export interface UserStatusUpdateResponse {
    id: string;
    username: string;
    email: string | null;
    role: 'user' | 'admin';
    status: 'active' | 'suspended' | 'banned';
}

// ============================================
// Notification Response Types
// ============================================

export interface NotificationResponse {
    id: string;
    type: 'video_approved' | 'video_rejected' | 'comment_reply' | 'system';
    title: string;
    message: string | null;
    link: string | null;
    is_read: boolean;
    read_at: Date | null;
    created_at: Date;
}

// ============================================
// Playlist Response Types
// ============================================

export interface PlaylistResponse {
    id: string;
    title: string;
    slug: string;
    description: string | null;
    thumbnail_url: string | null;
    is_public: boolean;
    video_count: number;
    created_by: string | null;
    created_at: Date;
    updated_at: Date;
}

// ============================================
// Category Response Types
// ============================================

export interface CategoryListItemResponse {
    id: string;
    name: string;
    slug: string;
    thumbnail_url: string | null;
    video_count: number;
    sort_order: number;
}
