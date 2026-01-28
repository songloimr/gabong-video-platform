import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  integer,
  timestamp,
  index,
} from 'drizzle-orm/pg-core';

export const bannerAds = pgTable(
  'banner_ads',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    name: varchar('name', { length: 100 }).notNull(),
    content: text('content').notNull(),
    link_url: text('link_url'),
    position: varchar('position', { length: 50 }).notNull(),
    is_active: boolean('is_active').default(true),
    impressions: integer('impressions').default(0),
    clicks: integer('clicks').default(0),
    created_at: timestamp('created_at').defaultNow(),
    updated_at: timestamp('updated_at').defaultNow(),
  },
  (table) => [
    index('idx_banner_ads_position').on(table.position),
    index('idx_banner_ads_is_active').on(table.is_active),
  ],
);
