# BACKEND KNOWLEDGE BASE

## OVERVIEW

NestJS 11 API server with Drizzle ORM, Bull queues, JWT auth, Cloudflare R2 storage.

## STRUCTURE

```
backend/src/
├── common/           # Shared filters, guards, interceptors, pipes
├── config/           # Environment config loaders
├── database/         # Drizzle module + schema definitions
├── modules/          # 19 feature modules (NestJS standard)
├── constants/        # App-wide constants
├── types/            # Shared TypeScript types
├── main.ts           # App bootstrap
├── app.module.ts     # Root module
└── seed.ts           # Database seeder
```

## WHERE TO LOOK

| Task | Location |
|------|----------|
| Add endpoint | `modules/{domain}/{domain}.controller.ts` |
| Add service logic | `modules/{domain}/{domain}.service.ts` |
| Add DTO | `modules/{domain}/dto/` |
| Add schema | `database/schema/{domain}.ts` + update `index.ts` |
| Add guard | `common/guards/` |
| Add filter | `common/filters/` |
| Add queue processor | `modules/{domain}/{domain}.processor.ts` |

## CONVENTIONS

### Module Structure (standard NestJS)
```
modules/{name}/
├── {name}.module.ts
├── {name}.controller.ts
├── {name}.service.ts
├── dto/
│   ├── create-{name}.dto.ts
│   └── update-{name}.dto.ts
└── {name}.processor.ts     # If uses Bull queue
```

### Drizzle Schema Pattern
```typescript
// database/schema/{name}.ts
export const {name}Table = pgTable('{name}', {
  id: text('id').primaryKey().$defaultFn(() => nanoid()),
  // ... fields
});

// Relations defined in same file
export const {name}Relations = relations({name}Table, ({ one, many }) => ({
  // ...
}));
```

### Validation
- Global ValidationPipe with `whitelist: true`, `forbidNonWhitelisted: true`
- DTOs use class-validator decorators
- Transform enabled with implicit conversion

### Error Handling
- `AllExceptionsFilter` as global filter
- `HttpExceptionFilter` for HTTP-specific errors
- `TransformInterceptor` wraps all responses

## ANTI-PATTERNS

- **strictNullChecks: false** - always use optional chaining `?.`
- **noImplicitAny: false** - types are loose, be explicit
- Throttling: 100 req/min globally

## QUEUE PATTERN (Bull)

```typescript
// In module
BullModule.registerQueue({ name: 'video-processing' })

// Processor
@Processor('video-processing')
export class VideoProcessingProcessor {
  @Process('transcode')
  async handleTranscode(job: Job) { ... }
}

// Adding job
this.queue.add('transcode', { videoId }, { attempts: 3 })
```

## DATABASE

- **ORM**: Drizzle (PostgreSQL)
- **Schema location**: `src/database/schema/`
- **Materialized views**: `schema/materialized-views.ts` for query optimization
- **Migrations**: `pnpm db:generate` then `pnpm db:push` (dev) or `db:migrate` (prod)
