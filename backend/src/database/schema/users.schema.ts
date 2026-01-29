import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  pgEnum,
  text,
  index,
  PgEnum,
} from 'drizzle-orm/pg-core';

export const userRoleEnum: PgEnum<["user", "admin"]> = pgEnum('user_role', ['user', 'admin']);
export const userStatusEnum = pgEnum('user_status', [
  'active',
  'suspended',
  'banned',
]);

export const users = pgTable(
  'users',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    username: varchar('username', { length: 50 }).unique().notNull(),
    email: varchar('email', { length: 100 }).unique(),
    password_hash: varchar('password_hash', { length: 255 }).notNull(),
    role: userRoleEnum('role').default('user'),
    status: userStatusEnum('status').default('active'),
    avatar_url: text('avatar_url'),
    bio: text('bio'),
    created_at: timestamp('created_at').defaultNow(),
    updated_at: timestamp('updated_at').defaultNow(),
    last_login_at: timestamp('last_login_at'),
    last_ip: varchar('last_ip', { length: 45 }),
  },
  (table) => [
    index('idx_users_username').on(table.username),
    index('idx_users_email').on(table.email),
    index('idx_users_status').on(table.status),
  ],
);

export const refreshTokens = pgTable(
  'refresh_tokens',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    user_id: uuid('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    token: varchar('token', { length: 500 }).unique().notNull(),
    expires_at: timestamp('expires_at').notNull(),
    created_at: timestamp('created_at').defaultNow(),
  },
  (table) => [
    index('idx_refresh_tokens_user_id').on(table.user_id),
  ],
);
