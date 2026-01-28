import {
  pgTable,
  uuid,
  varchar,
  text,
  integer,
  bigint,
  timestamp,
  pgEnum,
  index,
  boolean,
} from 'drizzle-orm/pg-core';
import { users } from './users.schema';
import { categories } from './categories.schema';

export const videoStatusEnum = pgEnum('video_status', [
  'pending_approval',
  'pending_processing',
  'processing',
  'approved',
  'rejected',
  'hidden',
]);


export const videoSourceTypeEnum = pgEnum('video_source_type', [
  'upload',
  'embed',
]);

export const videos = pgTable(
  'videos',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    title: varchar('title', { length: 255 }).notNull(),
    slug: varchar('slug', { length: 255 }).unique().notNull(),
    short_code: varchar('short_code', { length: 10 }).unique().notNull(),
    description: text('description'),
    source_type: videoSourceTypeEnum('source_type').default('upload'),

    video_url: text('video_url'),
    thumbnail_url: text('thumbnail_url'),
    storyboard_url: text('storyboard_url'),
    duration: integer('duration'),
    resolution: varchar('resolution', { length: 20 }),
    file_size: bigint('file_size', { mode: 'number' }),

    embed_url: text('embed_url'),
    embed_platform: varchar('embed_platform', { length: 50 }),

    views: integer('views').default(0),
    likes_count: integer('likes_count').default(0),
    comments_count: integer('comments_count').default(0),

    status: videoStatusEnum('status').default('pending_approval'),
    rejection_reason: text('rejection_reason'),

    local_path: text('local_path'),
    video_key: varchar('video_key', { length: 200 }),
    approved_at: timestamp('approved_at'),

    user_id: uuid('user_id').references(() => users.id, {
      onDelete: 'set null',
    }),
    category_id: uuid('category_id').references(() => categories.id, {
      onDelete: 'set null',
    }),

    published_at: timestamp('published_at'),
    created_at: timestamp('created_at').defaultNow(),
    updated_at: timestamp('updated_at').defaultNow(),
    custom_upload_date: timestamp('custom_upload_date'),
    is_pinned: boolean('is_pinned').default(false).notNull(),
    pinned_at: timestamp('pinned_at'),
  },
  (table) => [
    index('idx_videos_status').on(table.status),
    index('idx_videos_user_id').on(table.user_id),
    index('idx_videos_category_id').on(table.category_id),
    index('idx_videos_slug').on(table.slug),
    index('idx_videos_short_code').on(table.short_code),
    index('idx_videos_created_at').on(table.created_at),
    index('idx_videos_published_at').on(table.published_at),
    index('idx_videos_views').on(table.views),
    index('idx_videos_likes').on(table.likes_count),
    index('idx_videos_is_pinned').on(table.is_pinned),
  ],
);
