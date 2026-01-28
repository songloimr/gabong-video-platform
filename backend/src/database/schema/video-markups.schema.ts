import {
  pgTable,
  uuid,
  varchar,
  text,
  integer,
  timestamp,
  index,
} from 'drizzle-orm/pg-core';
import { videos } from './videos.schema';

export const videoMarkups = pgTable(
  'video_markups',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    video_id: uuid('video_id').notNull().references(() => videos.id, { onDelete: 'cascade' }),
    time: integer('time').notNull(),
    text: text('text').notNull(),
    width: varchar('width', { length: 20 }).notNull().default('5s'),
    sort_order: integer('sort_order').default(0),
    created_at: timestamp('created_at').defaultNow(),
    updated_at: timestamp('updated_at').defaultNow(),
  },
  (table) => [
    index('idx_video_markups_video_id').on(table.video_id),
    index('idx_video_markups_time').on(table.time),
  ],
);
