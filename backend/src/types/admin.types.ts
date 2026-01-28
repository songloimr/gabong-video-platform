import { SQL } from 'drizzle-orm';

// ============================================
// Dashboard Stats Types
// ============================================

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

// ============================================
// Analytics Types
// ============================================

export interface AnalyticsDataPoint {
    date: string;
    value: number;
}

export interface AnalyticsResponse {
    data: AnalyticsDataPoint[];
}

// ============================================
// Drizzle OrderBy Type
// ============================================

// Generic type for Drizzle orderBy expressions
export type DrizzleOrderBy = SQL | SQL[];
