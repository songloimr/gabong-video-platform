# Gabong Backend API

Backend API for Gabong Video Platform built with NestJS and Drizzle ORM.

## Tech Stack

- **Framework**: NestJS 10.x
- **ORM**: Drizzle ORM with PostgreSQL
- **Authentication**: JWT (access + refresh tokens)
- **Validation**: class-validator + class-transformer
- **File Upload**: Multer with Cloudflare R2
- **Video Processing**: FFmpeg + Sharp
- **Queue**: Bull + Redis
- **Schedule**: @nestjs/schedule

## Features

- User authentication with JWT
- Multi-file video upload (max 5 concurrent)
- Video approval workflow
- Comments (nested, unlimited depth)
- Categories and tags
- Playlists (admin only)
- Watch later with resume position
- Notifications (polling-based)
- Admin dashboard with analytics
- Materialized views for performance

## Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration files
│   ├── common/          # Common utilities (guards, decorators, filters, etc.)
│   ├── database/        # Drizzle schema and database service
│   ├── modules/         # Feature modules
│   │   ├── auth/
│   │   ├── users/
│   │   ├── videos/
│   │   ├── comments/
│   │   ├── categories/
│   │   ├── tags/
│   │   ├── playlists/
│   │   ├── watch-later/
│   │   ├── notifications/
│   │   ├── admin/
│   │   ├── cron/
│   │   ├── upload/
│   │   ├── banner-ads/
│   │   └── short-links/
│   ├── types/           # TypeScript type definitions
│   ├── app.module.ts    # Root module
│   └── main.ts          # Entry point
├── drizzle.config.ts    # Drizzle configuration
├── package.json
└── tsconfig.json
```

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Copy `.env.example` to `.env` and update the values:

```bash
cp .env.example .env
```

Required variables:
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret for access token signing
- `JWT_REFRESH_SECRET` - Secret for refresh token signing

### 3. Database Setup

```bash
# Push schema to database
npx drizzle-kit push:pg

# Or generate and run migrations
npx drizzle-kit generate:pg
npx drizzle-kit migrate:pg
```

### 4. Run Development Server

```bash
npm run start:dev
```

API will be available at `http://localhost:3000/api`

## API Documentation

### Authentication

**POST /api/auth/register**
```json
{
  "username": "johndoe",
  "password": "password123",
  "email": "john@example.com"
}
```

**POST /api/auth/login**
```json
{
  "username": "johndoe",
  "password": "password123",
  "remember_me": false
}
```

**POST /api/auth/refresh**
```json
{
  "refresh_token": "..."
}
```

### Videos

**GET /api/videos**
Query params: `page`, `limit`, `category`, `tag`, `sort`, `search`

**GET /api/videos/:slug**

**POST /api/videos/upload** (requires auth)
Content-Type: `multipart/form-data`

**POST /api/videos/:id/like** (requires auth)

**POST /api/videos/:id/view**

### Comments

**GET /api/videos/:videoId/comments**

**POST /api/videos/:videoId/comments** (requires auth)

**DELETE /api/comments/:id** (requires auth)

### And more...

See the PRD for complete API documentation.

## Database Schema

All tables use `snake_case` naming convention.

### Main Tables:
- `users` - User accounts
- `refresh_tokens` - JWT refresh tokens
- `videos` - Video metadata
- `upload_sessions` - Upload tracking
- `categories` - Video categories
- `tags` - Video tags
- `video_tags` - Many-to-many relationship
- `comments` - Video comments
- `likes` - Video likes
- `playlists` - Playlists (admin only)
- `playlist_videos` - Playlist-video relationship
- `watch_later` - Watch later list
- `notifications` - User notifications
- `banner_ads` - Banner advertisements

### Materialized Views:
- `mv_video_stats` - Video statistics
- `mv_dashboard_stats` - Dashboard metrics
- `mv_category_stats` - Category statistics

## Commands

```bash
# Development
npm run start:dev          # Start with hot reload
npm run start:debug         # Start in debug mode

# Build
npm run build               # Build for production
npm run start:prod          # Run production build

# Testing
npm run test                # Run unit tests
npm run test:e2e            # Run e2e tests
npm run test:cov            # Run tests with coverage

# Linting
npm run lint                # Run ESLint
npm run format              # Format code with Prettier

# Database
npx drizzle-kit push:pg     # Push schema changes
npx drizzle-kit generate:pg # Generate migration
npx drizzle-kit studio      # Open Drizzle Studio
```

## Naming Conventions

### Backend (NestJS)
- **Database columns**: `snake_case` (e.g., `user_id`, `created_at`)
- **API response fields**: `snake_case` (e.g., `status_code`, `is_liked`)
- **File naming**: `kebab-case.ts` (e.g., `users.service.ts`)
- **Class naming**: `PascalCase` (e.g., `UsersService`)
- **Method naming**: `camelCase` (e.g., `findAll()`)

## Security

- JWT authentication with access (30m) and refresh (7d) tokens
- Password hashing with bcrypt (10 rounds)
- Rate limiting (100 requests per minute)
- File upload validation (MIME type, size, duration)
- XSS protection with DOMPurify
- CORS enabled for frontend origin

## License

Proprietary
