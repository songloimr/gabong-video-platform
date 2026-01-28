import {
  pgTable,
  uuid,
  varchar,
  integer,
  timestamp,
  index,
} from 'drizzle-orm/pg-core';

export const categories = pgTable(
  'categories',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    name: varchar('name', { length: 100 }).notNull(),
    slug: varchar('slug', { length: 100 }).unique().notNull(),
    sort_order: integer('sort_order').default(0),
    created_at: timestamp('created_at').defaultNow(),
  },
  (table) => [
    index('idx_categories_slug').on(table.slug),
    index('idx_categories_sort_order').on(table.sort_order),
  ],
);
