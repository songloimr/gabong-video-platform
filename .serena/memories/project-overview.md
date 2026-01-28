# Gabong Video Platform - Project Overview

## Project Purpose
Video streaming platform similar to Pornhub/Xvideos with mobile-first design. Key features:
- Multi-file video upload (max 5 concurrent, 500MB each, 15 min duration)
- Admin approval workflow for uploads
- Embedded video support (YouTube, etc.)
- Watch later with resume position
- Nested comments (unlimited depth)
- Admin-only playlists
- Polling-based notifications (30s interval)
- Auto-generated short link per video (8 chars nanoid)
- SEO-optimized URLs with slug-based routing
- Banner ads support
- Dark/Light theme switching

## Tech Stack

### Backend
- **Framework**: NestJS 10.0.0
- **ORM**: Drizzle ORM 0.45.1
- **Database**: PostgreSQL with pg driver 8.16.3
- **Language**: TypeScript 5.1.3 (strict mode disabled in tsconfig)
- **Testing**: Jest 29.5.0

### Frontend
- **Framework**: SvelteKit 2.49.1
- **UI Library**: Skeleton Labs 4.9.0 (Cerberus theme)
- **Styling**: TailwindCSS 4.1.17
- **Data Fetching**: TanStack Query (to be added)
- **Database**: Drizzle ORM 0.45.0 with postgres 3.4.7

### Infrastructure (planned)
- Storage: Cloudflare R2
- Process Manager: PM2
- Reverse Proxy: Nginx

## Project Structure

```
gabong-net/
├── backend/              # NestJS API
│   ├── src/
│   │   ├── main.ts      # Entry point
│   │   ├── app.module.ts # Root module
│   │   └── ...
│   ├── package.json
│   ├── tsconfig.json
│   └── .eslintrc.js
│
├── frontend/            # SvelteKit App
│   ├── src/
│   ├── package.json
│   ├── svelte.config.js
│   └── ...
│
└── video-platform-prd-v19.md  # Product Requirements Document
```

## Key Conventions

### Backend (NestJS)
- **Database columns**: snake_case (e.g., `user_id`, `created_at`)
- **API response fields**: snake_case (e.g., `status_code`, `is_liked`)
- **File naming**: kebab-case for files (e.g., `users.service.ts`)
- **Class naming**: PascalCase (e.g., `UsersService`)
- **Method naming**: camelCase (e.g., `findAll()`)
- **Decorators**: Standard NestJS decorators (`@Controller`, `@Get`, `@Post`, etc.)
- **Type safety**: Strict TypeScript with interfaces and DTOs

### Frontend (SvelteKit)
- **Component naming**: PascalCase.svelte (e.g., `VideoCard.svelte`)
- **Utility files**: kebab-case.ts (e.g., `formatters.ts`)
- **Query keys**: Array pattern (e.g., `['videos', 'list', params]`)
- **Stores**: lowercase with underscores (e.g., `auth_store`)

## Security & Validation
- JWT authentication with access (30m) and refresh (7d) tokens
- Password hashing with bcrypt (10 rounds)
- File upload validation: MIME types, 500MB limit, 15 min duration
- XSS protection with DOMPurify
- Rate limiting with NestJS Throttler

## PRD Reference
Current PRD version: v19 (January 13, 2026)
Path: /Users/songloimr/SideProjects/gabong-net/video-platform-prd-v19.md

Key changes from v18:
- snake_case for database and API
- Polling notifications (no WebSocket)
- Materialized views for analytics
- Removed: admin logs, email reset, view history, like comment, short link endpoint
- Updated: categories schema (single name field), short_code auto-generated
- Frontend: TanStack Query instead of fetch/axios
