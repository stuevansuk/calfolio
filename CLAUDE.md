# Platform Blueprint

> Distilled from SetFlow. Same stack, domain-agnostic, sequential build for a single agent.

## Stack

Next.js 16 (App Router), React 19, TypeScript (strict), Tailwind CSS 4, PostgreSQL 17, Drizzle ORM, BetterAuth, Zustand, Stripe, Resend, PostHog, Vitest. Deploy: Coolify on Hetzner VPS (4vCPU/8GB/160GB).

## Architecture Rules

1. No API abstraction — call Drizzle directly in routes
2. No automatic background syncing — components call sync explicitly
3. No custom hooks unless shared across 3+ components
4. No factory patterns or DI — prefer if/else
5. Flat API routes: auth → validate → query → respond
6. API envelope: `{ success: boolean, data?, error? }` always
7. Named exports in lib files. Throw early, catch at boundaries
8. Server-side enforcement for tier/rate/auth. Client checks are UX only
9. IDOR protection: userId in every WHERE clause on user-owned resources
10. Generic errors to clients. Log details server-side only

## Directory Structure

```
src/app/              — Pages (api/, app/ protected, (marketing)/ public)
src/components/       — layout/, ui/, auth/, tier/, settings/, feedback/, [domain]/
src/contexts/         — auth-context.tsx only
src/lib/              — auth/, db/ (schema.ts + api.ts), email/, stripe/, rate-limit.ts, tier-check.ts, constants.ts
src/stores/           — app-store.ts (single Zustand store)
src/types/            — index.ts (shared types)
tests/                — unit/ (mirror lib/), integration/ (mirror api/), mocks/, fixtures/
scripts/              — DB init, reset, clean, migrations, verify-test-user
```

## Build Phases

### Phase 1: Scaffold
`npx create-next-app@latest --typescript --tailwind --app --src-dir`. Create directory structure above. Configure tsconfig (strict, `@/` alias), vitest (separate unit/integration configs), `.env.example`.

### Phase 2: Database Schema (`src/lib/db/schema.ts`)
Core tables: `profiles` (userId, email, tier, trialEndsAt, monthly counters, stripe fields, email tracking timestamps, engagement timestamps), `[domain_entities]` (userId indexed, domain fields, timestamps), `feedback` + `feedback_votes`, `webhook_events` (Stripe idempotency), `exit_surveys`, `deleted_emails` (trial re-abuse prevention). Auto-create profile via DB trigger on user creation. Index every userId column + query patterns.

### Phase 3: Query Layer (`src/lib/db/api.ts`)
Direct Drizzle calls only. Functions: fetchProfile, updateProfile (whitelist safe fields), fetch/insert/bulkInsert/update/delete per entity. IDOR pattern: `where(and(eq(table.id, id), eq(table.userId, userId)))` — null result = not found or not owned → 404.

### Phase 4: Types (`src/types/index.ts`)
`ApiResponse<T>` envelope, `UserProfile`, `Tier` union, types per domain entity. Keep DB and API types aligned — no separate DTOs.

### Phase 5: Auth (`src/lib/auth/config.ts`)
BetterAuth: 24h sessions, 1h update age, 5min cookie cache, email verification required, Google OAuth with account linking. Route: `/api/auth/[...all]`. Auth context provides: user, loading, signOut, refreshSession, refreshProfile. On login: fetch `/api/profile`, set Zustand user, trigger syncFromDatabase if >5min stale.

### Phase 6: Rate Limiting (`src/lib/rate-limit.ts`)
In-memory sliding window, keyed by userId or IP. Configs: auth (10/min), api (200/min), import (60/min), generation (10/min), stripe (10/min), feedback (20/min), contact (5/hr per IP), accountDeletion (5/24h). Auto-cleanup expired entries every 5min. Returns `{ allowed, remaining, resetAt }`.

### Phase 7: Tier System (`src/lib/tier-check.ts`)
Tiers: trial (7 days, limited counts), hobby (monthly limits), pro (unlimited), free (expired trial, read-only). Define `TIER_LIMITS` object per tier with: entity caps, output caps (trial=total, hobby=monthly), duration limits, export limits, org unit caps, feature flags (smartFeatures, aiFeatures). Helper: `isTrialExpired(date)`, `canPerformAction(profile, action) → { allowed, reason, limit, used }`. Monthly counter reset: check `monthlyCounterResetAt`, reset if past.

### Phase 8: Constants (`src/lib/constants.ts`)
Centralize: tier names, trial duration, pagination defaults/max, batch sizes, sync stale threshold.

### Phase 9: API Route Pattern
Every route: auth check (401) → rate limit (429) → validate input (400) → tier check if needed (403) → Drizzle query → respond. Next.js 16 dynamic params are Promises: `const { id } = await params`. Paginated GETs: `?limit=50&offset=0` with max caps, `?all=true` capped at 10k.

### Phase 10: API Routes to Build

**Auth/Account:** `/api/auth/[...all]` (BetterAuth), `/api/profile` GET/PATCH (safe fields only), `/api/account` DELETE (email confirm + password re-auth, cancel Stripe, hash email), `/api/account/providers` GET.

**Domain Entities:** `/api/[entities]` GET (paginated) / POST (single or bulk, tier check) / DELETE (bulk by IDs), `/api/[entities]/all` DELETE, `/api/[entities]/[id]` PATCH/DELETE (IDOR), `/api/[entities]/bulk` PATCH (IDOR).

**Generated Outputs:** `/api/[outputs]` GET (paginated) / POST (tier enforcement, increment counters), `/api/[outputs]/[id]` PATCH/DELETE (IDOR, supports upsert), `/api/[outputs]/[id]/share` POST/DELETE (create/revoke share link), `/api/[outputs]/public/[shareId]` GET (no auth, sanitized response).

**Organization Units:** `/api/[org-units]` GET/POST (tier limit on count, smart type requires Pro), `/api/[org-units]/[id]` GET/PATCH/DELETE (IDOR, cascade), `/api/[org-units]/[id]/items` GET/POST/DELETE/PATCH (manage items, PATCH=reorder).

**Calendar Events:** `/api/[events]` GET/POST (free tier blocked), `/api/[events]/[id]` GET/PATCH/DELETE (IDOR, free blocked), `/api/[events]/[id]/[link]` PATCH (link/unlink output).

**Feedback:** `/api/feedback` GET (supports `?my`, `?board`, `?admin`) / POST, `/api/feedback/[id]` GET/PATCH/DELETE (PATCH/DELETE admin-only, soft delete), `/api/feedback/vote` POST/DELETE (409 on duplicate).

**Stripe:** `/api/stripe/checkout` POST (create session or upgrade in-place), `/api/stripe/success` GET (validate + create subscription + update tier), `/api/stripe/resume` POST, `/api/stripe/portal` POST, `/api/stripe/verify-session` POST, `/api/stripe/webhook` POST (signature verified, idempotent via webhook_events, handle subscription.updated/deleted + charge.failed/succeeded), `/api/stripe/sync` POST.

**Email:** `/api/email/welcome` POST, `/api/email/trial-reminders` POST (cron: day-3, day-6, expired; check unsubscribed + tracking timestamps; budget cap 25/run; 750ms delay between sends), `/api/email/unsubscribe` GET (signed token, returns HTML).

**Admin:** `/api/admin/metrics` GET, `/api/admin/metrics/content` GET, `/api/admin/metrics/engagement` GET, `/api/admin/metrics/revenue` GET. Admin check: `ADMIN_EMAILS` env var, empty = deny all.

**Misc:** `/api/health` GET (no auth, DB check), `/api/contact` POST (no auth, rate limit by IP), `/api/exit-survey` POST, `/api/ai/usage` GET.

### Phase 11: Zustand Store (`src/stores/app-store.ts`)
Single store. Persist only small data (builderConfig, user) — never persist entity arrays. State sections: user, entities[], outputs[] + currentOutput, orgUnits[] + activeId, events[], builderConfig, isGenerating, lastSyncedAt, syncInProgress. Each entity type gets: local CRUD methods + database sync methods (addToDatabase, updateToDatabase, deleteFromDatabase). `syncFromDatabase(userId)`: paginated fetch (500/batch for entities, 100/batch for outputs), merge DB data with local (keep unpersisted local items), set lastSyncedAt. Optimistic mutations: update local state immediately, API call in background, replace temp ID with real on success. Memoized stats: hash-based cache, recompute only when data changes. `clearStore()` on logout.

### Phase 12: Stripe Integration
Config: `src/lib/stripe/config.ts` with PRICE_IDS per tier/interval. Checkout flow: POST checkout → create customer if needed → create session → redirect to Stripe → success redirect with session_id → verify-session → update profile → refreshProfile. Webhook: verify signature → check idempotency table → handle event → update profile → insert event ID. Upgrade in-place: `stripe.subscriptions.update()` with proration. Portal: `stripe.billingPortal.sessions.create()` with return URL. Env separation: TEST keys for dev/staging, LIVE for prod.

### Phase 13: Email System
Resend for sending. Base HTML template (600px max, responsive). Templates: verification, password reset, welcome, trial day-3 reminder, trial day-6 expiring, trial expired, win-back. Unsubscribe: signed token → GET endpoint → set emailUnsubscribed=true → HTML confirmation. Cron pattern: query eligible profiles → filter unsubscribed → filter already-sent (tracking timestamps) → send with delay → update timestamps → budget cap.

### Phase 14: Pages & Layouts
Root layout: AuthProvider + PostHogProvider. App layout: auth gate (redirect if not logged in), Header + ErrorBoundary + StripeProvider. Pages: `/` (marketing), `/app` (main tool), `/app/library` (content mgmt), `/app/[builder]` (manual creation), `/app/[calendar]` (scheduling), `/app/history` (saved outputs), `/app/settings` (account), `/app/admin/metrics` + `/app/admin/feedback` (admin), `/s/[shareId]` (public share), `/blog`, `/changelog`, `/help`, `/terms`, `/privacy`, `/reset-password`.

### Phase 15: Navigation
Desktop: sticky top header — logo, 5 nav links (Create/Library/Builder/Calendar/History), content count, tier badge, user menu dropdown. Mobile: minimal top bar (logo + user), fixed bottom nav (5 icons with labels), `pb-[env(safe-area-inset-bottom)]`.

### Phase 16: Tier UI Components
`TrialCountdownBanner` (days remaining, usage progress, upgrade CTA), `ExpiredTrialOverlay` (full-screen blocker, must upgrade), `TierBadge` (colored badge, click to upgrade), `UpgradeModal` (comparison table, pricing toggle, Stripe checkout), `useTierLimits` hook (canGenerate, canExport, isTrialExpired, tier).

### Phase 17: Page Layout Patterns
Main tool: 2/5 config + 3/5 output (mobile: stacked). Onboarding: 3-step progress if library empty (Import → Generate → Export). Library: sidebar org-units + table with sort/filter/bulk/search/pagination. Builder: tabs (My Items + Builder with browser|builder panels). Calendar: list/calendar toggle, cards with edit/delete/complete/link. History: search + filter pills + expandable cards + pagination. Settings: stacked sections (profile, plan, security, accounts, links, danger zone).

### Phase 18: Interaction Patterns
Modals: lazy-loaded heavy ones, useState trigger, close on cancel/backdrop/success. Delete: confirmation dialog with typed confirmation for destructive ops. Toasts: success (green 3s), error (red 5s), info (blue 3s). Forms: disable + spinner on submit, toast result, keep open on error. Search: controlled input, debounced, useMemo filtered results, client-side. Drag-drop: @dnd-kit for reordering. Pagination: client-side slice with page/perPage state.

### Phase 19: Mobile Patterns
<md = mobile, md+ = desktop. Mobile swaps: top nav → bottom nav, columns → stacked, sidebar → drawer/button, centered modals → full-width slide-up, side-by-side → tab switching, full calendar → compact picker, inline filters → horizontal scroll.

### Phase 20: Testing
Unit: mirror src/lib/, test edge cases + boundaries, 80%+ coverage on business logic. Integration: mirror src/app/api/, use mock handlers. Mock infra: mockState object (session, profile, rateLimitAllowed), resetMockState in beforeEach. Required tests per route: 401 (unauth), 400 (validation), 403 (IDOR), 403 (tier), 429 (rate limit), 200 (success). Use `vi.hoisted()` for mock state, `Promise.resolve()` for Next.js 16 params.

### Phase 21: Scripts
`init-db.js` (prod, idempotent), `setup-db.js` (dev, drizzle-kit), `reset-db.js` (destructive, --force), `clean-db.js` (selective, --tracks/--outputs/--all), `verify-test-user.js` (bypass email verification), `db-storage.js` (analysis). Migration scripts per feature, all idempotent.

### Phase 22: Deployment (Coolify on Hetzner)

#### Environments
3 environments: feature (feature/*), staging (develop, dev.app.com), production (main, app.com). Each needs unique: DATABASE_URL, BETTER_AUTH_SECRET, Stripe keys (TEST vs LIVE).

#### Coolify Resource Setup (per environment)

**1. Database** — Standalone PostgreSQL 17:
- Name: `{app}-{env}-db` (e.g. `myapp-dev-db`)
- Server: localhost (Coolify host)
- Public: No (internal network only)
- Image: `postgres:17`

**2. Application** — GitHub source via private GitHub App:
- Build pack: `nixpacks`
- Port: `3000`
- FQDN: `https://www.{domain},https://{domain}` (prod) or `https://dev.{domain}` (staging)
- Health check: enabled, `GET /api/health`, interval 30s, retries 3, return code 200, start period 30s, timeout 10s
- Git branch: `main` (prod), `develop` (staging), `feature/*` (feature)
- Auto-deploy on push

**3. Environment Variables** — Bulk set via Coolify:
- `DATABASE_URL` from internal DB connection string
- `BETTER_AUTH_SECRET` (unique per env, generated)
- `BETTER_AUTH_URL` / `NEXT_PUBLIC_APP_URL` / `TRUSTED_ORIGINS` (matching FQDN)
- Stripe: TEST keys for dev/staging, LIVE for prod
- All other env vars per Env Vars section

**4. DNS** — A records pointing domain to Hetzner VPS IP. Coolify/Traefik handles HTTPS via Let's Encrypt.

**5. Post-deploy** — Schema changes: run migration via Coolify Execute Command. After develop→main merge: `git checkout develop && git reset --hard origin/main && git push origin develop --force`.

## Env Vars

DATABASE_URL, BETTER_AUTH_SECRET, BETTER_AUTH_URL, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY, NEXT_PUBLIC_STRIPE_PRICE_{HOBBY,PRO}_{MONTHLY,ANNUAL}, RESEND_API_KEY, EMAIL_FROM, ADMIN_EMAILS (empty=deny all), NEXT_PUBLIC_POSTHOG_KEY, NEXT_PUBLIC_POSTHOG_HOST, NEXT_PUBLIC_APP_URL, TRUSTED_ORIGINS, R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME, R2_PUBLIC_URL, PRODIGI_API_KEY, PRODIGI_SANDBOX_API_KEY, PRODIGI_WEBHOOK_SECRET, PRODIGI_API_URL, USE_SANDBOX_PRINT.

## Security Checklist

IDOR on all user resources, rate limiting on all endpoints, server-side tier enforcement, generic client errors, Zod validation on all inputs, Stripe webhook signature verification, webhook idempotency, XXE prevention on file parsing, file upload limits, XSS sanitization, email unsubscribe compliance, deleted email hashing, admin gated by env var.
