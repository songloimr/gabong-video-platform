import {
    pgTable,
    uuid,
    varchar,
    jsonb,
    text,
    timestamp,
    index,
} from 'drizzle-orm/pg-core';

export const siteSettings = pgTable(
    'site_settings',
    {
        id: uuid('id').defaultRandom().primaryKey(),
        key: varchar('key', { length: 255 }).notNull().unique(),
        value: jsonb('value').notNull(),
        description: text('description'),
        updated_at: timestamp('updated_at').defaultNow().notNull(),
        created_at: timestamp('created_at').defaultNow().notNull(),
    },
    (table) => [
        index('idx_site_settings_key').on(table.key),
    ],
);
