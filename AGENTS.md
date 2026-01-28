# GABONG-NET KNOWLEDGE BASE

**Generated:** 2026-01-23
**Type:** Video platform monorepo

## OVERVIEW

Video streaming platform with SvelteKit 5 frontend + NestJS 11 backend. PostgreSQL + Drizzle ORM. Cloudflare R2 storage. Bull queues for video processing.

## STRUCTURE

```
gabong-net/
├── frontend/          # SvelteKit 5 + Svelte 5 runes + TailwindCSS 4 + Skeleton UI
├── backend/           # NestJS 11 + Drizzle ORM + Bull queues
└── PRD/               # Product requirement docs (v18, v19)
```

## WHERE TO LOOK

| Task | Location | Notes |
|------|----------|-------|
| Add API endpoint | `backend/src/modules/{domain}/` | Standard NestJS module structure |
| Add frontend route | `frontend/src/routes/` | SvelteKit routing: (app)/, (admin)/ groups |
| Add DB table | `backend/src/database/schema/` | Drizzle schema, run `db:generate` after |
| Add component | `frontend/src/lib/components/` | Grouped by domain (video/, admin/, ui/) |
| Add API query | `frontend/src/lib/api/queries/` | TanStack Query pattern |
| Add mutation | `frontend/src/lib/api/mutations/` | TanStack mutation pattern |
| Add store | `frontend/src/lib/stores/` | Svelte 5 runes class pattern |
| Config env | `backend/src/config/` | database, jwt, cloudflare, redis configs |

## CONVENTIONS

### TypeScript
- Backend: **LOOSE** types (strictNullChecks:false, noImplicitAny:false)
- Frontend: Standard strict mode

### Patterns
- **API client**: Axios wrapper in `frontend/src/lib/api/client.ts`
- **Queries**: TanStack Query with `queryKeys` factory pattern
- **Stores**: Svelte 5 runes with `$state` class pattern (see `auth.svelte.ts`)
- **i18n**: svelte-i18n, stores in `frontend/src/lib/i18n/`

### Naming
- Backend modules: kebab-case directories (`watch-later/`, `site-settings/`)
- Schema files: kebab-case (`banner-ads.ts`, `watch-later.ts`)
- Components: kebab-case directories, PascalCase files

## ANTI-PATTERNS (THIS PROJECT)

- **No strict null checks in backend** - be defensive with optional chaining
- **CORS is `origin: "*"`** in main.ts - security TODO
- Global prefix is `/api` - all backend routes prefixed

## COMMANDS

```bash
# Backend
cd backend
pnpm dev                    # Start dev server (port 3000)
pnpm db:generate           # Generate Drizzle migrations
pnpm db:push               # Push schema to DB (dev only)
pnpm db:migrate            # Run migrations (prod)
pnpm db:studio             # Drizzle Studio GUI
pnpm db:seed               # Seed database
pnpm test                  # Jest tests

# Frontend
cd frontend
pnpm dev                   # Start dev server (port 5173)
pnpm build                 # Build for production
```

## TECH STACK

| Layer | Tech |
|-------|------|
| Frontend | SvelteKit 5.46, Svelte 5, TailwindCSS 4, Skeleton UI 4 |
| State | TanStack Query 6, Svelte 5 runes |
| Video | vidstack, hls.js |
| Editor | TipTap |
| Backend | NestJS 11, Drizzle ORM 0.45 |
| DB | PostgreSQL |
| Queue | Bull (Redis) |
| Storage | Cloudflare R2 (S3 API) |
| Auth | JWT + Passport |
| Media | fluent-ffmpeg |

## MODULES (19 backend domains)

`admin` `announcements` `auth` `banner-ads` `categories` `comments` `cron` `media-processing` `notifications` `playlists` `search` `site-settings` `storage` `tags` `upload` `users` `video-processing` `videos` `watch-later`

## NOTES

- Video processing is async via Bull queues (`video-processing`, `media-processing` modules)
- Schema has materialized views for performance (`backend/src/database/schema/materialized-views.ts`)
- Frontend uses route groups: `(app)/` for user-facing, `(admin)/` for admin panel
