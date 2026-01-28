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

export const announcementTypeEnum = pgEnum('announcement_type', [
    'info',
    'warning',
    'success',
    'error',
]);

export const announcementPositionEnum = pgEnum('announcement_position', [
    'header_bar',
    'homepage_banner',
    'video_sidebar',
]);

export const announcements = pgTable(
    'announcements',
    {
        id: uuid('id').defaultRandom().primaryKey(),
        title: varchar('title', { length: 255 }).notNull(),
        content: text('content').notNull(),
        type: announcementTypeEnum('type').notNull().default('info'),
        position: announcementPositionEnum('position').notNull().default('header_bar'),
        is_active: boolean('is_active').default(true).notNull(),
        start_date: timestamp('start_date'),
        end_date: timestamp('end_date'),
        created_by: uuid('created_by')
            .references(() => users.id, { onDelete: 'set null' }),
        created_at: timestamp('created_at').defaultNow().notNull(),
        updated_at: timestamp('updated_at').defaultNow().notNull(),
    },
    (table) => [
        index('idx_announcements_is_active').on(table.is_active),
        index('idx_announcements_position').on(table.position),
        index('idx_announcements_dates').on(table.start_date, table.end_date),
        index('idx_announcements_created_at').on(table.created_at),
    ],
);
