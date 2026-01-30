import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  index,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { users } from './users.schema';

export const feedbackTypeEnum = pgEnum('feedback_type', [
  'bug',
  'suggestion',
  'other',
]);

export const feedbacks = pgTable(
  'feedbacks',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    type: feedbackTypeEnum('type').notNull(),
    title: varchar('title', { length: 200 }).notNull(),
    content: text('content').notNull(),
    user_id: uuid('user_id').references(() => users.id, {
      onDelete: 'set null',
    }),
    ip_address: varchar('ip_address', { length: 45 }),
    created_at: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    index('idx_feedbacks_type').on(table.type),
    index('idx_feedbacks_user_id').on(table.user_id),
    index('idx_feedbacks_created_at').on(table.created_at),
  ],
);
