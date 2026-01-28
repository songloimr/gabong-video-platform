import {
  pgTable,
  uuid,
  varchar,
  integer,
  timestamp,
  index,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { videos } from './videos.schema';

export const tags = pgTable(
  'tags',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    name: varchar('name', { length: 50 }).unique().notNull(),
    slug: varchar('slug', { length: 50 }).unique().notNull(),
    usage_count: integer('usage_count').default(0),
    created_at: timestamp('created_at').defaultNow(),
  },
  (table) => [
    index('idx_tags_slug').on(table.slug),
  ],
);

export const videoTags = pgTable(
  'video_tags',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    video_id: uuid('video_id')
      .references(() => videos.id, { onDelete: 'cascade' })
      .notNull(),
    tag_id: uuid('tag_id')
      .references(() => tags.id, { onDelete: 'cascade' })
      .notNull(),
    created_at: timestamp('created_at').defaultNow(),
  },
  (table) => [
    index('idx_video_tags_video_id').on(table.video_id),
    index('idx_video_tags_tag_id').on(table.tag_id),
    uniqueIndex('idx_video_tags_unique').on(table.video_id, table.tag_id),
  ],
);
