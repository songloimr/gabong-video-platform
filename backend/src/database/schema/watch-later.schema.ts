import { pgTable, uuid, integer, timestamp, index, uniqueIndex } from 'drizzle-orm/pg-core';
import { users } from './users.schema';
import { videos } from './videos.schema';

export const watchLater = pgTable(
  'watch_later',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    user_id: uuid('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    video_id: uuid('video_id')
      .references(() => videos.id, { onDelete: 'cascade' })
      .notNull(),
    watch_position: integer('watch_position').default(0),
    added_at: timestamp('added_at').defaultNow(),
    updated_at: timestamp('updated_at').defaultNow(),
  },
  (table) => [
    index('idx_watch_later_user_id').on(table.user_id),
    index('idx_watch_later_added_at').on(table.added_at),
    uniqueIndex('idx_watch_later_unique').on(table.user_id, table.video_id),
  ],
);
