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

export const subtitles = pgTable(
  'subtitles',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    video_id: uuid('video_id').notNull().references(() => videos.id, { onDelete: 'cascade' }),
    label: varchar('label', { length: 100 }).notNull(),
    language_code: varchar('language_code', { length: 10 }).notNull(),
    vtt_content: text('vtt_content').notNull(),
    sort_order: integer('sort_order').default(0),
    created_at: timestamp('created_at').defaultNow(),
    updated_at: timestamp('updated_at').defaultNow(),
  },
  (table) => [
    index('idx_subtitles_video_id').on(table.video_id),
  ],
);
