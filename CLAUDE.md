# Platform Blueprint

> Reusable stack, architecture, and quality standards across all projects. Domain-agnostic.

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

---

## Visual Design Standards

### Typography
- Use Google Fonts via `next/font/google`. Pair a display/serif font (headings) with a clean sans-serif (body).
- Set CSS variables: `--font-heading`, `--font-body` in layout.tsx, reference via `@theme inline` in globals.css.
- Apply heading font with `font-[family-name:var(--font-heading)]`.
- Never use developer-oriented fonts (Geist, Inter, Roboto) for consumer products.

### Color Palette
- Define warm, non-corporate palettes. Use Tailwind's named scales (stone, rose, amber, emerald, etc.).
- Set `:root` vars for `--background` and `--foreground` in globals.css.
- Never use pure black (`text-black`, `bg-black`) — use `stone-800` or `stone-900`.
- Choose a primary accent (e.g., rose-500), warm highlights (e.g., amber-50/100), and semantic colors (emerald=success, amber=warning, red=danger).
- Backgrounds: warm off-whites (stone-50), cards on white, sections on subtle gradients.

### Component Patterns
- **Buttons**: `rounded-full` pill shape. Primary: `bg-{accent}-500 hover:bg-{accent}-600 text-white`. Secondary: `border border-stone-200 text-stone-600 hover:bg-stone-50`.
- **Cards**: `rounded-2xl shadow-sm hover:shadow-md bg-white`. No hard borders — use shadow for depth.
- **Focus rings**: `focus:ring-2 focus:ring-{accent}-300 focus:ring-offset-2`.
- **Inputs**: `rounded-lg border border-stone-200 focus:border-{accent}-300 focus:ring-{accent}-300`.

### CSS Animations (globals.css)
Include these utilities in every project:
- `@keyframes fadeIn`, `fadeInScale`, `slideUp` with corresponding `.animate-*` classes.
- Stagger delays: `.delay-75` through `.delay-375` (75ms increments).
- `.hover-lift` for card hover (-2px translateY).
- Global smooth transition on `a, button, input, select, textarea`.

---

## Landing Page Completeness Checklist

Every public-facing homepage must include these sections. Reference: amberline.app, setflow.app.

### Required Sections
1. **Sticky header** — Logo (serif font), anchor nav (Features, Pricing, Templates/equivalent), social icons (relevant to audience), Sign In (secondary) + Get Started (primary) CTAs. Use `sticky top-0 z-50 bg-white/80 backdrop-blur-md`.
2. **Hero** — Gradient background, pill badge, serif heading with gradient accent text, description, dual CTAs, social proof (avatar row + "Trusted by..." text), "No credit card required" note.
3. **Product showcase** — Template gallery, screenshot carousel, or interactive demo. Show the actual product.
4. **How it works** — 3-4 numbered steps with icons.
5. **Features grid** — 2x3 or 3x2 grid of feature cards with icon circles, titles, descriptions.
6. **Pricing** — Inline on homepage (not separate page only). Free trial + paid tiers in columns. Include print/physical pricing if applicable. "Most Popular" badge on recommended tier.
7. **FAQ accordion** — 4-6 questions using `<details>/<summary>` with rounded borders and chevron rotation.
8. **Final CTA** — Dark warm background (stone-800), heading, subtitle, primary CTA, trust signals.
9. **Multi-column footer** — Brand + description, Product links, Legal links, Social icons. Gradient top border.

### Common Mistakes to Avoid
- No "Get Started" CTA in header (only Sign In)
- Pricing on separate page with no preview on homepage
- No social icons anywhere
- Minimal footer with no structure
- No FAQ section
- No social proof / testimonials
- Missing anchor nav for single-page scroll

---

## Usability Standards

### Navigation
- **Active states**: Highlight current page link in accent color (e.g., rose-600). Use `usePathname()` in client layout. Both desktop and mobile nav.
- **Breadcrumbs**: Required on all nested pages (editor, order flow, detail views). Format: `Dashboard / Page Name` with links. Style: `text-sm text-stone-400`, current page in `text-stone-600`.
- **Shared layouts**: Marketing pages MUST have a shared `(marketing)/layout.tsx` with header + footer. Never duplicate header/footer in individual page components.

### Empty States
- Never show just "No items yet" — always include:
  1. An inline SVG illustration (warm palette, simple shapes)
  2. A warm heading and supportive subtitle
  3. A CTA button guiding the next action
  4. Optional: feature hints or benefits

### Multi-Step Flows (Wizards)
- **Step indicators**: Numbered circles with labels underneath. Active: accent color. Completed: accent. Upcoming: stone-200.
- **Step connectors**: Lines between dots that fill with accent color as steps complete.
- **Back navigation**: Every step (except the first) must have a back button.
- **Progress context**: Show what was selected in previous steps (e.g., template preview in config step).

### Forms & Feedback
- **Save confirmation**: Show inline success toast (green, auto-dismiss 3s) after saves. Show error toast (red, 5s) on failure.
- **Submit states**: Disable button + show spinner text ("Saving...", "Creating...") during submission.
- **Destructive actions**: Require typed confirmation. Don't pre-fill the confirmation input.

### Dashboard
- **Greeting**: Time-of-day greeting with user's first name ("Good morning, Sarah").
- **Card information density**: Status badges, relative timestamps ("Edited 2 days ago"), metadata (year, size, template).
- **Contextual subtitles**: "3 calendars in progress" not just "3 calendars".

---

## Common Bugs to Watch

- **PostgreSQL COUNT returns strings**: Drizzle/pg may return COUNT values as strings. Always wrap in `Number()` before arithmetic to avoid string concatenation (`"1" + "0" = "10"` instead of `1`).
- **Next.js 16 dynamic params are Promises**: `const { id } = await params`.
- **Route group layouts**: `(marketing)/layout.tsx` must exist for shared header/footer across marketing pages.
- **Static page caching**: Landing page changes may require cache-busting on deploy. Coolify redeploys rebuild but the old container may serve stale static pages briefly.

---

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

### Phase 10: API Routes
Standard routes per project: auth, profile, account, domain entities (CRUD + bulk + IDOR), generated outputs (with share links), organization units (with cascade delete), feedback (with voting), Stripe (checkout, webhook, portal, sync), email (welcome, trial reminders, unsubscribe), admin metrics, health check, contact form.

### Phase 11: Zustand Store (`src/stores/app-store.ts`)
Single store. Persist only small data (builderConfig, user) — never persist entity arrays. Each entity type gets: local CRUD methods + database sync methods. `syncFromDatabase(userId)`: paginated fetch, merge DB data with local (keep unpersisted local items). Optimistic mutations: update local state immediately, API call in background. Memoized stats: hash-based cache. `clearStore()` on logout.

### Phase 12: Stripe Integration
Config with PRICE_IDS per tier/interval. Checkout flow → success redirect → verify-session → update profile. Webhook: verify signature → check idempotency → handle event → update profile. Env separation: TEST keys for dev/staging, LIVE for prod.

### Phase 13: Email System
Resend for sending. Templates: verification, password reset, welcome, trial reminders, win-back. Unsubscribe: signed token → HTML confirmation. Cron pattern with budget caps and delay between sends.

### Phase 14: Pages & Layouts
Root layout: AuthProvider + PostHogProvider. Marketing layout: shared header/footer with active nav states. App layout: auth gate, sticky header with active nav, tier badge, mobile bottom nav. Pages: `/` (homepage), `/app` (dashboard), `/app/[domain-pages]`, `/app/settings`, `/app/admin/*`, `/s/[shareId]` (public share), legal pages.

### Phase 15: Navigation
Desktop: sticky top header — logo, nav links with active states (accent color), tier badge, user menu. Mobile: minimal top bar, fixed bottom nav with active states, `pb-[env(safe-area-inset-bottom)]`.

### Phase 16: Tier UI Components
`TrialCountdownBanner`, `ExpiredTrialOverlay`, `TierBadge` (amber/rose/violet/stone per tier), `UpgradeModal`.

### Phase 17-19: Page Patterns
See Usability Standards section above for layout patterns, interaction patterns, and mobile patterns.

### Phase 20: Testing
Unit: mirror src/lib/, 80%+ coverage on business logic. Integration: mirror src/app/api/. Required tests per route: 401, 400, 403 (IDOR), 403 (tier), 429, 200. Use `vi.hoisted()` for mock state.

### Phase 21: Scripts
`init-db.js` (prod, idempotent), `setup-db.js` (dev), `reset-db.js` (destructive), `clean-db.js` (selective), `verify-test-user.js`, seed scripts per domain. All idempotent.

### Phase 22: Deployment (Coolify on Hetzner)
3 environments: feature (feature/*), staging (develop), production (main). Coolify resources: PostgreSQL 17 (internal), nixpacks app, health check on `/api/health`. Auto-deploy on push. DNS: A records to Hetzner VPS, Traefik handles HTTPS via Let's Encrypt.

## Env Vars

DATABASE_URL, BETTER_AUTH_SECRET, BETTER_AUTH_URL, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY, NEXT_PUBLIC_STRIPE_PRICE_{HOBBY,PRO}_{MONTHLY,ANNUAL}, RESEND_API_KEY, EMAIL_FROM, ADMIN_EMAILS (empty=deny all), NEXT_PUBLIC_POSTHOG_KEY, NEXT_PUBLIC_POSTHOG_HOST, NEXT_PUBLIC_APP_URL, TRUSTED_ORIGINS.

## Security Checklist

IDOR on all user resources, rate limiting on all endpoints, server-side tier enforcement, generic client errors, Zod validation on all inputs, Stripe webhook signature verification, webhook idempotency, XXE prevention on file parsing, file upload limits, XSS sanitization, email unsubscribe compliance, deleted email hashing, admin gated by env var.

## Quality Testing Workflow

1. `npm run build` — must pass with zero errors before any deploy
2. Visual E2E via Chrome DevTools MCP — screenshot every page after deploy
3. Check for stale color references (grep for `gray-`, `blue-`, `text-black`, old font names)
4. Verify console errors on every page
5. Test empty states, active nav states, and responsive layouts
6. Verify API responses (string vs number types from PostgreSQL)
