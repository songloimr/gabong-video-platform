import {
  pgTable,
  uuid,
  text,
  boolean,
  timestamp,
  index,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { videos } from './videos.schema';
import { users } from './users.schema';

export const comments = pgTable(
  'comments',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    video_id: uuid('video_id')
      .references(() => videos.id, { onDelete: 'cascade' })
      .notNull(),
    user_id: uuid('user_id').references(() => users.id, {
      onDelete: 'set null',
    }),
    parent_id: uuid('parent_id').references((): any => comments.id, {
      onDelete: 'cascade',
    }),
    content: text('content').notNull(),
    is_hidden: boolean('is_hidden').default(false),
    hidden_by: uuid('hidden_by').references(() => users.id),
    hidden_at: timestamp('hidden_at'),
    created_at: timestamp('created_at').defaultNow(),
    updated_at: timestamp('updated_at').defaultNow(),
  },
  (table) => [
    index('idx_comments_video_id').on(table.video_id),
    index('idx_comments_parent_id').on(table.parent_id),
    index('idx_comments_user_id').on(table.user_id),
    index('idx_comments_created_at').on(table.created_at),
  ],
);

export const likes = pgTable(
  'likes',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    video_id: uuid('video_id')
      .references(() => videos.id, { onDelete: 'cascade' })
      .notNull(),
    user_id: uuid('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    created_at: timestamp('created_at').defaultNow(),
  },
  (table) => [
    index('idx_likes_video_id').on(table.video_id),
    index('idx_likes_user_id').on(table.user_id),
    uniqueIndex('idx_likes_unique').on(table.video_id, table.user_id),
  ],
);
