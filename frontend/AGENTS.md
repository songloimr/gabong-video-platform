# FRONTEND KNOWLEDGE BASE

## OVERVIEW

SvelteKit 5 + Svelte 5 runes + TailwindCSS 4 + Skeleton UI 4. TanStack Query for data fetching.

## STRUCTURE

```
frontend/src/
├── routes/
│   ├── (app)/         # User-facing routes
│   ├── (admin)/       # Admin panel routes
│   └── +layout.*      # Root layout
├── lib/
│   ├── api/           # API client, queries, mutations
│   ├── components/    # UI components by domain
│   ├── stores/        # Svelte 5 runes stores
│   ├── i18n/          # Internationalization
│   ├── types/         # TypeScript types
│   └── utils/         # Helper functions
└── app.html           # HTML template
```

## WHERE TO LOOK

| Task | Location |
|------|----------|
| Add page | `routes/(app)/[path]/+page.svelte` |
| Add admin page | `routes/(admin)/admin/[path]/+page.svelte` |
| Add component | `lib/components/{domain}/` |
| Add query | `lib/api/queries/{domain}.ts` |
| Add mutation | `lib/api/mutations/{domain}.ts` |
| Add store | `lib/stores/{name}.svelte.ts` |
| Add translation | `lib/i18n/locales/{lang}.json` |

## CONVENTIONS

### TanStack Query Pattern
```typescript
// lib/api/queries/videos.ts
export const videoKeys = {
  all: ['videos'] as const,
  lists: () => [...videoKeys.all, 'list'] as const,
  detail: (id: string) => [...videoKeys.all, 'detail', id] as const,
};

export function getVideosQuery(params?: VideoQueryParams) {
  return createQuery({
    queryKey: videoKeys.lists(),
    queryFn: () => api.get<VideoListResponse>('/videos', { params }),
  });
}
```

### Svelte 5 Runes Store Pattern
```typescript
// lib/stores/auth.svelte.ts
class AuthStore {
  user = $state<User | null>(null);
  isAuthenticated = $derived(!!this.user);
  
  login(user: User) { this.user = user; }
  logout() { this.user = null; }
}

export const authStore = new AuthStore();
```

### Component Organization
- `components/ui/` - Generic reusable (buttons, inputs, modals)
- `components/video/` - Video-specific (player, cards, lists)
- `components/admin/` - Admin panel components
- `components/common/` - Shared layout pieces
- `components/forms/` - Form components

### API Client
```typescript
// lib/api/client.ts
import axios from 'axios';
export const api = axios.create({ baseURL: '/api' });
```

## ANTI-PATTERNS

- Don't use legacy Svelte stores (`writable`, `readable`) - use Svelte 5 runes
- Don't fetch in `+page.svelte` directly - use TanStack Query
- Don't hardcode API URLs - use `api` client

## STYLING

- **Framework**: TailwindCSS 4 + Skeleton UI 4
- **Theme**: Skeleton theme system
- **Responsive**: Mobile-first approach

## VIDEO PLAYER

- **Library**: vidstack with HLS support (hls.js)
- **Location**: `lib/components/video/`
