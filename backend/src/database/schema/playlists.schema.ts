import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  integer,
  timestamp,
  index,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { users } from './users.schema';
import { videos } from './videos.schema';

export const playlists = pgTable(
  'playlists',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    title: varchar('title', { length: 255 }).notNull(),
    slug: varchar('slug', { length: 255 }).unique().notNull(),
    description: text('description'),
    thumbnail_url: text('thumbnail_url'),
    is_public: boolean('is_public').default(true),
    video_count: integer('video_count').default(0),
    created_by: uuid('created_by').references(() => users.id, {
      onDelete: 'set null',
    }),
    created_at: timestamp('created_at').defaultNow(),
    updated_at: timestamp('updated_at').defaultNow(),
  },
  (table) => [
    index('idx_playlists_slug').on(table.slug),
    index('idx_playlists_created_by').on(table.created_by),
  ],
);

export const playlistVideos = pgTable(
  'playlist_videos',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    playlist_id: uuid('playlist_id')
      .references(() => playlists.id, { onDelete: 'cascade' })
      .notNull(),
    video_id: uuid('video_id')
      .references(() => videos.id, { onDelete: 'cascade' })
      .notNull(),
    position: integer('position').notNull(),
    added_at: timestamp('added_at').defaultNow(),
  },
  (table) => [
    index('idx_playlist_videos_playlist_id').on(table.playlist_id),
    index('idx_playlist_videos_position').on(table.position),
    uniqueIndex('idx_playlist_videos_unique').on(table.playlist_id, table.video_id),
  ],
);
