# GABONG-NET AGENT GUIDE

**Type:** Video streaming platform monorepo  
**Stack:** SvelteKit 5 + NestJS 11 + PostgreSQL + Drizzle ORM

## QUICK REFERENCE

```
gabong-net/
├── frontend/    # SvelteKit 5, Svelte 5 runes, TailwindCSS 4, Skeleton UI 4
├── backend/     # NestJS 11, Drizzle ORM 0.45, Bull queues, JWT auth
└── PRD/         # Product requirement docs
```

## COMMANDS

### Backend (`cd backend`)
```bash
pnpm dev                              # Dev server (port 3000)
pnpm build                            # Build for production
pnpm lint                             # ESLint with auto-fix
pnpm format                           # Prettier format

# Testing
pnpm test                             # Run all tests
pnpm test -- --testPathPattern=auth   # Run tests matching "auth"
pnpm test -- src/modules/videos       # Run tests in specific directory
pnpm test -- auth.service.spec.ts     # Run single test file
pnpm test:watch                       # Watch mode
pnpm test:cov                         # With coverage
pnpm test:e2e                         # E2E tests (uses test/jest-e2e.json)

# Database
pnpm db:generate                      # Generate Drizzle migrations
pnpm db:push                          # Push schema to DB (dev only)
pnpm db:migrate                       # Run migrations (production)
pnpm db:studio                        # Open Drizzle Studio GUI
pnpm db:seed                          # Seed database
```

### Frontend (`cd frontend`)
```bash
pnpm dev                              # Dev server (port 5173)
pnpm build                            # Build for production
pnpm check                            # Svelte type checking
pnpm check:watch                      # Type check watch mode
pnpm lint                             # ESLint
```

## CODE STYLE

### TypeScript Configuration
- **Backend:** LOOSE types (`strictNullChecks: false`, `noImplicitAny: false`)
- **Frontend:** Strict mode enabled

### Formatting (Backend Prettier)
- Single quotes: `'string'`
- Trailing commas: always
- Run `pnpm format` before committing

### Import Order
```typescript
// 1. External packages
import { Injectable, NotFoundException } from '@nestjs/common';
import { eq, desc, sql } from 'drizzle-orm';

// 2. Internal absolute paths
import { DrizzleService } from '../../database/drizzle.service';
import { videos, users } from '../../database/schema';

// 3. Types (use `import type` for type-only imports)
import type { PaginatedResponse, VideoListItemResponse } from '../../types';

// 4. Relative imports (DTOs, helpers)
import { CreateVideoDto, UpdateVideoDto } from './dto';
```

### Naming Conventions
| Item | Convention | Example |
|------|------------|---------|
| Backend modules | kebab-case directories | `watch-later/`, `site-settings/` |
| Schema files | kebab-case | `banner-ads.ts`, `watch-later.ts` |
| Component directories | kebab-case | `video/`, `admin/`, `ui/` |
| Component files | PascalCase | `VideoCard.svelte` |
| Services/Controllers | PascalCase + suffix | `VideosService`, `AuthController` |
| DTOs | PascalCase + Dto suffix | `CreateVideoDto`, `UpdateVideoDto` |

### DTO Validation (Backend)
Use `class-validator` decorators:
```typescript
export class CreateVideoDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(100)
  @IsSecure()  // Custom XSS sanitization validator
  title: string;

  @IsOptional()
  @IsUUID()
  category_id?: string;
}
```

### Error Handling (Backend)
Use NestJS built-in exceptions:
```typescript
throw new NotFoundException('Video not found');
throw new ForbiddenException('Not authorized');
throw new BadRequestException('Invalid input');
```

### Svelte 5 Stores Pattern
Use runes-based class pattern with `.svelte.ts` extension:
```typescript
// auth.svelte.ts
class AuthStore {
  state = $state<AuthState>({ user: null, token: null });
  get user() { return this.state.user; }
  get isAuthenticated() { return !!this.state.token; }
}
export const auth = new AuthStore();
```

### TanStack Query Pattern
Use `queryKeys` factory and `createQuery`:
```typescript
export const videoKeys = {
  all: ['videos'] as const,
  lists: () => [...videoKeys.all, 'list'] as const,
  list: (params: VideoListParams) => [...videoKeys.lists(), params] as const,
};

export function useVideos(paramsGetter: () => VideoListParams) {
  return createQuery(() => ({
    queryKey: videoKeys.list(paramsGetter()),
    queryFn: async () => {
      const { data } = await api.get<PaginatedResponse<Video[]>>('/api/videos', { params: paramsGetter() });
      return data;
    },
  }));
}
```

## WHERE TO ADD CODE

| Task | Location | Notes |
|------|----------|-------|
| API endpoint | `backend/src/modules/{domain}/` | controller.ts, service.ts, module.ts |
| Frontend route | `frontend/src/routes/` | `(app)/` for users, `(admin)/` for admin |
| DB table | `backend/src/database/schema/` | Run `pnpm db:generate` after changes |
| Component | `frontend/src/lib/components/` | Grouped: video/, admin/, ui/ |
| API query | `frontend/src/lib/api/queries/` | TanStack Query hooks |
| Mutation | `frontend/src/lib/api/mutations/` | TanStack mutations |
| Store | `frontend/src/lib/stores/` | `.svelte.ts` extension |
| Config | `backend/src/config/` | database, jwt, cloudflare, redis |
| Types | `frontend/src/lib/types/` or `backend/src/types/` | Shared type definitions |

## IMPORTANT NOTES

- **API prefix:** All backend routes use `/api` global prefix
- **Auth:** JWT + Passport, tokens in Authorization header
- **Video processing:** Async via Bull queues (`video-processing`, `media-processing`)
- **Storage:** Cloudflare R2 (S3-compatible API)
- **CORS:** Currently `origin: "*"` - security consideration

## BACKEND MODULES (21 domains)

`admin` `announcements` `auth` `banner-ads` `categories` `comments` `cron` `media-processing` `notifications` `playlists` `search` `site-settings` `storage` `subtitles` `tags` `upload` `users` `video-markups` `video-processing` `videos` `watch-later`

## TEST FILE PATTERN

Backend tests use `*.spec.ts`:
```typescript
import { Test, TestingModule } from '@nestjs/testing';

describe('VideosService', () => {
  let service: VideosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [VideosService, /* mocked deps */],
    }).compile();
    service = module.get<VideosService>(VideosService);
  });

  it('should find video by id', async () => {
    expect(await service.findOne('uuid')).toBeDefined();
  });
});
```
