# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server on port 80 (proxies /admin-api → localhost:48080)
npm run build        # Type-check + production build
npm run preview      # Preview production build locally
```

No test runner is configured. Type checking is done via `vue-tsc -b` as part of the build.

## Architecture

**Stack**: Vue 3.5 + TypeScript + Vite 6 + Pinia + Element Plus + Axios

### API Layer (`src/api/`)

All API calls go through a single Axios instance in `request.ts`. The interceptor handles:
- Auth: reads `ACCESS_TOKEN` from localStorage via `parseToken()` in `src/utils/token.ts`. Token is stored as `{ c, e, v }` where `v` is the actual token value (double-JSON-encoded). The router guard inlines its own equivalent parsing instead of calling `parseToken` — keep both in sync if the format changes.
- XSS sanitization of outgoing request bodies (skips FormData)
- Global loading indicator (suppressed for certain endpoints via `NO_LOADING_APIS`)
- Silent error suppression for certain endpoints via `SILENT_APIS`
- 401 responses on non-public endpoints clear storage and redirect to `/login`

All API functions are defined in `article.ts` (despite the name, it covers all domains: auth, articles, comments, talks, albums, etc.).

### State Management (`src/stores/`)

Two stores:
- `user.ts` — login state, token, user profile. Calls `initFromStorage()` synchronously on import to restore session from localStorage. Login stores token in `{ c, e, v }` format with a far-future expiry (`e: '253402300799000'`).
- `theme.ts` — light/dark/auto mode. Applies theme by setting `data-theme` attribute on `<html>`. CSS variables in `src/styles/global.scss` respond to this attribute.

### Routing (`src/router/index.ts`)

Routes with `meta: { requiresAuth: true }` redirect to `/login` if unauthenticated. The `beforeEach` guard also attempts to restore session from localStorage on every navigation if a token exists but the store has no user.

### Theming

Theme is driven entirely by CSS custom properties scoped to `[data-theme="light"]` and `[data-theme="dark"]` selectors in `src/styles/global.scss`. Element Plus uses the sass import style for theme integration.

### Caching (`src/utils/cache.ts`)

Three-tier cache: in-memory `CacheManager` (TTL-based, max 100 entries, auto-purge every 10 min) → `localCache` (localStorage with TTL) → `sessionCache` (sessionStorage with TTL). Website config (`src/utils/websiteConfig.ts`) uses all three tiers in sequence.

### Build Output

Vite splits chunks into `vue-vendor`, `element-plus`, and `utils`. Assets are organized into `js/`, `images/`, `fonts/`, `css/` subdirectories. Console statements are stripped in production via Terser.

### Environment Variables

| Variable | Purpose |
|---|---|
| `VITE_API_BASE_URL` | Axios baseURL, defaults to `/admin-api` |
| `VITE_BASE_PATH` | Router history base and Vite `base`, defaults to `/` |
| `VITE_ADMIN_PATH` | Path to admin panel |
