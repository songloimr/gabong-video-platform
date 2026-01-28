import { integer, text, timestamp, bigint, pgMaterializedView } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { videos } from './videos.schema';
import { categories } from './categories.schema';
import { users } from './users.schema';
import { comments } from './comments.schema';

// Materialized view for video stats with joins
export const mvVideoStats = pgMaterializedView('mv_video_stats', {
  video_id: text('video_id').notNull(),
  title: text('title'),
  slug: text('slug'),
  views: integer('views'),
  likes_count: integer('likes_count'),
  comments_count: integer('comments_count'),
  published_at: timestamp('published_at'),
  category_name: text('category_name'),
  uploader_name: text('uploader_name'),
})
  .with({
    fillfactor: 70,
  })
  .as(
    sql`SELECT 
      v.id as video_id,
      v.title,
      v.slug,
      v.views,
      v.likes_count,
      v.comments_count,
      v.published_at,
      c.name as category_name,
      u.username as uploader_name
    FROM ${videos} v
    LEFT JOIN ${categories} c ON v.category_id = c.id
    LEFT JOIN ${users} u ON v.user_id = u.id
    WHERE v.status = 'approved'`,
  );

// Materialized view for dashboard aggregated stats
export const mvDashboardStats = pgMaterializedView('mv_dashboard_stats', {
  total_users: bigint('total_users', { mode: 'number' }),
  total_videos: bigint('total_videos', { mode: 'number' }),
  pending_approval_videos: bigint('pending_approval_videos', { mode: 'number' }),
  pending_processing_videos: bigint('pending_processing_videos', { mode: 'number' }),
  processing_videos: bigint('processing_videos', { mode: 'number' }),
  total_views: bigint('total_views', { mode: 'number' }),
  total_comments: bigint('total_comments', { mode: 'number' }),
  today_uploads: bigint('today_uploads', { mode: 'number' }),
  today_registrations: bigint('today_registrations', { mode: 'number' }),
  refreshed_at: timestamp('refreshed_at'),
}).as(
  sql`SELECT 
    (SELECT COUNT(*) FROM ${users} WHERE status = 'active') as total_users,
    (SELECT COUNT(*) FROM ${videos} WHERE status = 'approved') as total_videos,
    (SELECT COUNT(*) FROM ${videos} WHERE status = 'pending_approval') as pending_approval_videos,
    (SELECT COUNT(*) FROM ${videos} WHERE status = 'pending_processing') as pending_processing_videos,
    (SELECT COUNT(*) FROM ${videos} WHERE status = 'processing') as processing_videos,
    (SELECT COALESCE(SUM(views), 0) FROM ${videos} WHERE status = 'approved') as total_views,
    (SELECT COUNT(*) FROM ${comments} WHERE is_hidden = false) as total_comments,
    (SELECT COUNT(*) FROM ${videos} WHERE DATE(created_at) = CURRENT_DATE) as today_uploads,
    (SELECT COUNT(*) FROM ${users} WHERE DATE(created_at) = CURRENT_DATE) as today_registrations,
    NOW() as refreshed_at`,
);

// Materialized view for category stats
export const mvCategoryStats = pgMaterializedView('mv_category_stats', {
  category_id: text('category_id').notNull(),
  name: text('name'),
  slug: text('slug'),
  video_count: bigint('video_count', { mode: 'number' }),
  total_views: bigint('total_views', { mode: 'number' }),
})
  .with({
    fillfactor: 70,
  })
  .as(
    sql`SELECT 
      c.id as category_id,
      c.name,
      c.slug,
      COUNT(v.id) as video_count,
      COALESCE(SUM(v.views), 0) as total_views
    FROM ${categories} c
    LEFT JOIN ${videos} v ON c.id = v.category_id AND v.status = 'approved'
    GROUP BY c.id, c.name, c.slug`,
  );
