import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  timestamp,
  pgEnum,
  index,
} from 'drizzle-orm/pg-core';
import { users } from './users.schema';

export const notificationTypeEnum = pgEnum('notification_type', [
  'video_approved',
  'video_rejected',
  'comment_reply',
  'system',
]);

export const notifications = pgTable(
  'notifications',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    user_id: uuid('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    type: notificationTypeEnum('type').notNull(),
    title: varchar('title', { length: 255 }).notNull(),
    message: text('message'),
    link: text('link'),
    is_read: boolean('is_read').default(false),
    read_at: timestamp('read_at'),
    created_at: timestamp('created_at').defaultNow(),
  },
  (table) => [
    index('idx_notifications_user_id').on(table.user_id),
    index('idx_notifications_is_read').on(table.is_read),
    index('idx_notifications_created_at').on(table.created_at),
  ],
);
