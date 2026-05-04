# GoRola Session History Archive (v1)
> Sessions 0 through 80.

**Session 0 (Project Setup):**
- Project files created by architect based on design system and requirements
- Design system colors and typography confirmed from Figma export
- Two categories for v1: Groceries, Medical
- Two stores for v1 (code supports N stores)
- Web-only for v1, no mobile app
- Rider interface deferred, stubs required
- Railway.app chosen for free deployment
- Fast2SMS for OTP (India, free tier)
- Confirmed: TDD is non-negotiable

**Session 2 (Phase 1.2 Schema):**
- Added Prisma schema with complete Phase 1.2 entity set, enums, relations, and indexes in `GoRola_app/apps/api/prisma/schema.prisma`.
- Added deterministic seed script in `GoRola_app/apps/api/prisma/seed.ts` for 2 stores, 2 owners, Groceries/Medical categories, sample products, and feature flags.
- Added Prisma scripts/dependencies in `GoRola_app/apps/api/package.json`; `prisma format` and `prisma validate` pass locally.

**Session 4 (Phase 1.3 Store repository):**
- `findAll` default filter: `isActive: true` and `isDeleted: false` (buyer-visible stores). Optional `includeInactive` / `includeDeleted` for admin-style listings later.
- Store has no unique phone in Prisma; repository does not map `ConflictError` on create (unlike `User`).

**Session 5 (Phase 1.3 Store owner repository):**
- `StoreOwnerRepository` has no `softDelete` method yet (checklist scoped to find + create + update); soft-delete behavior tested via direct Prisma updates and `includeDeleted` reads.

**Session 6 (Phase 1.3 Admin repository):**
- Checklist scope: `findById`, `findByEmail`, `create` only (no `update` / `softDelete` in Phase 1.3 list).
- **TDD for agents:** add integration/unit tests, add repository stub that throws `Error("TDD_RED:…")`, run `pnpm --filter @gorola/api test` and confirm failures, then replace stub with real Prisma code until GREEN.

**Session 7 (Phase 1.3 Catalog repositories):**
- **Category:** `findById` / `findBySlug` / `findAll` respect `isActive` (no `isDeleted` on model); `create` / `update` with `ConflictError` on slug `P2002`.
- **Product:** `findById` (soft-delete), `findByStoreId` (active + not deleted by default), `create` / `update`; `P2003` → `NotFoundError` for missing store/category.
- **Variant:** class name `ProductVariantRepository` in `variant.repository.ts`; `findById` / `findByProductId` respect `isActive`; `price` accepted as `string | number` and stored via `Prisma.Decimal`.

**Session 8 (Phase 1.3 Cart repository):**
- `addItem` upserts user cart and merges duplicate variant rows by incrementing quantity (`cartId + productVariantId` unique key).
- `updateQty` and `addItem` enforce positive quantity with `ValidationError`; `removeItem` / `updateQty` throw `NotFoundError` when line item missing.
- `clearCart` empties existing carts and creates an empty cart for users without one.

**Session 9 (Phase 1.3 Order repository):**
- `create` writes `Order`, `OrderItem[]`, and initial `OrderStatusHistory` (`PLACED`) in one Prisma create call.
- `updateStatus` uses a transaction to update `Order.status` and append status history atomically.
- `addStatusHistory` appends independent status events without mutating `Order.status`; missing order maps to `NotFoundError`.

**Session 10 (Phase 1.3 Address repository):**
- `create` and `update` enforce a single active default address per user by unsetting prior defaults in a transaction.
- `softDelete` marks `isDeleted: true` and clears `isDefault`; reads exclude deleted rows unless `includeDeleted` is set.
- `lat` / `lng` are converted to `Prisma.Decimal` only when explicitly provided to satisfy strict optional typing.

**Session 11 (Phase 1.3 Advertisement repository):**
- `findActive` returns only records with `isActive: true`, `isApproved: true`, and current timestamp within `[startsAt, endsAt]`.
- `create` defaults to `isActive: true`, `isApproved: false`; missing store FK (`P2003`) maps to `NotFoundError`.
- `approve` and `deactivate` update flags by id and map missing rows (`P2025`) to `NotFoundError`.

**Session 12 (Phase 1.3 Remaining repositories):**
- **Offer:** active-window filtering + deactivate behavior; missing store FK maps to `NotFoundError`.
- **Discount:** `findActiveByCode`, `create`, `incrementUsedCount`; missing store/id maps to `NotFoundError`.
- **Feature Flag:** `getAll`, `getByKey`, `update` by key.
- **Audit:** `create` only (immutable logging contract).
- **Delivery Rider (stub):** methods intentionally throw `NotImplementedError` (Phase 5 deferred).

**Session 13 (Phase 1.4 Bootstrap foundation):**
- Added `apps/api/src/__tests__/integration/server/server.bootstrap.test.ts` first, then confirmed RED (missing `server.ts`), then stubbed `createServer()` with `TDD_RED`, then implemented GREEN.
- Added `apps/api/src/server.ts` with Fastify instance factory, plugin wiring (helmet/cors/rate-limit/cookie/request-id), standardized success/error envelopes, and `GET /api/health`.
- Added `apps/api/src/app.ts` startup entrypoint and `apps/api/src/lib/redis.ts` singleton helper; test env skips Redis-backed rate limit wiring to keep integration tests deterministic.
- Verification: `pnpm --filter @gorola/api lint`, `pnpm --filter @gorola/api typecheck`, and full `pnpm --filter @gorola/api test` (177 passing).

**Session 14 (Phase 1.4 completion hardening):**
- Added RED tests for startup/listen behavior (`app.start.test.ts`) and secure cookie flags in `server.bootstrap.test.ts`, then implemented GREEN updates.
- `server.ts` now enforces default secure cookie options (`HttpOnly`, `SameSite=Lax`, `Secure` in production) and supports `disableRedis` option for deterministic integration tests.
- Verification: `pnpm --filter @gorola/api test -- --run src/__tests__/integration/server/server.bootstrap.test.ts src/__tests__/integration/server/app.start.test.ts`, `pnpm --filter @gorola/api lint`, `pnpm --filter @gorola/api typecheck`, and full `pnpm --filter @gorola/api test` (179 passing).

**Session 15 (Phase 1.5 buyer auth service):**
- Added tests first in `apps/api/src/__tests__/unit/auth/auth.service.test.ts` covering all buyer OTP service cases from checklist.
- Confirmed RED on missing module import, added auth scaffolding (`auth.types.ts`, `auth.errors.ts`, `auth.schema.ts`) and `auth.service.ts` TDD stubs throwing `TDD_RED`, then confirmed RED again.
- Implemented GREEN `AuthService` methods (`sendOtp`, `verifyOtp`, `refreshToken`, `logout`) with OTP TTL/rate-limit checks and token-service delegation; added `bcryptjs` for OTP hash/verify.
- Verification: `pnpm --filter @gorola/api test -- --run src/__tests__/unit/auth/auth.service.test.ts`, `pnpm --filter @gorola/api lint`, `pnpm --filter @gorola/api typecheck`, and full `pnpm --filter @gorola/api test` (189 passing).

**Session 16 (Phase 1.5 buyer controller + middleware):**
- Added RED tests first: `apps/api/src/__tests__/integration/auth/auth.controller.test.ts` and `apps/api/src/__tests__/unit/auth/auth.middleware.test.ts`.
- Implemented GREEN modules: `apps/api/src/modules/auth/auth.controller.ts` (buyer OTP/verify/refresh/logout routes), `apps/api/src/modules/auth/auth.middleware.ts` (`requireAuth`, `requireRole`), and strict Zod parsing in `auth.schema.ts`.
- Added `zod` dependency and access-token payload/verifier types in `auth.types.ts`.
- Verification: targeted auth test run, `pnpm --filter @gorola/api lint`, `pnpm --filter @gorola/api typecheck`, and full `pnpm --filter @gorola/api test` (198 passing).

**Session 17 (Phase 1.5 store owner auth service):**
- Added tests first in `apps/api/src/__tests__/unit/auth/store-owner-auth.service.test.ts` and confirmed RED on missing service.
- Added `store-owner-auth.service.ts` stub throwing `TDD_RED`, reran tests to confirm RED, then implemented GREEN flow.
- Implemented service behaviors: credential login, generic auth failure message to avoid enumeration, 10/15m login rate limit, 2FA-required login validation, invalid TOTP handling, `setup2FA` secret + QR URI generation/persistence, and `verify2FA` enablement.
- Verification: `pnpm --filter @gorola/api test -- --run src/__tests__/unit/auth/store-owner-auth.service.test.ts`, `pnpm --filter @gorola/api lint`, `pnpm --filter @gorola/api typecheck`, and full `pnpm --filter @gorola/api test` (205 passing).

**Session 18 (Phase 1.5 admin auth service):**
- Added tests first in `apps/api/src/__tests__/unit/auth/admin-auth.service.test.ts` and confirmed RED on missing `admin-auth.service.ts`.
- Added `admin-auth.service.ts` stub throwing `TDD_RED`, reran tests to confirm RED, then implemented GREEN flow.
- Implemented service behaviors: generic credential failure handling, 10/15m login rate limit, mandatory TOTP for all admin logins, setup2FA secret + QR URI generation/persistence, and verify2FA validation against stored secret.
- Verification: `pnpm --filter @gorola/api test -- --run src/__tests__/unit/auth/admin-auth.service.test.ts`, `pnpm --filter @gorola/api lint`, `pnpm --filter @gorola/api typecheck`, and full `pnpm --filter @gorola/api test` (212 passing).

**Session 19 (Phase 1.5 auth integration closure):**
- Added RED tests for missing Store Owner/Admin auth HTTP endpoints in `apps/api/src/__tests__/integration/auth/auth.controller.test.ts` and confirmed 404 failures.
- Implemented GREEN route wiring in `apps/api/src/modules/auth/auth.controller.ts` for:
  - `POST /api/v1/auth/store-owner/login`
  - `POST /api/v1/auth/store-owner/setup-2fa`
  - `POST /api/v1/auth/store-owner/verify-2fa`
  - `POST /api/v1/auth/admin/login`
  - `POST /api/v1/auth/admin/setup-2fa`
  - `POST /api/v1/auth/admin/verify-2fa`
- Extended `apps/api/src/modules/auth/auth.schema.ts` with payload validation parsers for store-owner/admin login and 2FA setup/verify flows.
- Verification: `pnpm --filter @gorola/api test -- --run src/__tests__/integration/auth/auth.controller.test.ts`, `pnpm --filter @gorola/api lint`, `pnpm --filter @gorola/api typecheck`, and full `pnpm --filter @gorola/api test` (215 passing).

**Session 31 (Phase 2.1 shadcn/ui):**
- Initialized **shadcn** in `apps/web` with template **Vite** + **Radix** + **Nova** preset; added Phase 2.1 component bundle (`button`, `card`, `input`, `dialog`, `drawer`, `sheet`, `skeleton`, `badge`, `sonner`, `scroll-area`, `separator`, `tabs`, `avatar`, `dropdown-menu`), `src/lib/utils.ts` (`cn`), and merged **Tailwind v4** `index.css` with shadcn theme tokens. Removed unused **Geist** font in favor of existing GoRola **@theme** fonts. Small **TS/ESLint** fixes in generated `ui` files for `exactOptionalPropertyTypes` and `sonner` / `skeleton` / `dropdown-menu`.

**Session 32 (Phase 2.1 router, data layer, TDD):**
- **Vitest** + **@testing-library/react** + **jsdom** + **axios-mock-adapter**; `vitest.config.ts` uses `mergeConfig` + `defineConfig` from `vitest/config` on top of `vite.config.ts` (separate file avoids a Vite/TS `test` key typing conflict). `src/test/setup.ts`: `@testing-library/jest-dom/vitest` + `afterEach(cleanup)`.
- **Zustand:** `useAuthStore` (access/refresh, `setTokens`, `clearSession`), `useCartStore` (merge lines, `totalItemCount`, `setQty(→0)` removes), `useWeatherStore`, `useFeatureFlagsStore` — each with colocated `*.store.test.ts` (`renderHook` + `act`).
- **Axios** `src/lib/api.ts`: `createApiClient` + optional singleton `api` (null if `VITE_API_BASE_URL` is unset); request bearer from store; 401 → `instance.post` refresh with `_gorolaRefresh` (no bearer on that request) → parse `{ success, data: { accessToken, refreshToken } }` → `setTokens` → **one** retried request via `_gorolaRetry`; failed refresh or second 401 → `clearSession`. Tests cover `getNormalizedApiBaseUrl`, `Authorization` header, happy refresh path, and refresh 401.
- **TanStack Query:** `createAppQueryClient()` (`staleTime: 60_000`, `retry: 2`); `QueryClientProvider` in `main.tsx`.
- **React Router v6** — `BrowserRouter` in `main.tsx`, `Routes` / `Route path="/"` → `HomePage` in `App.tsx`. `src/app/router.test.tsx` smokes the home route. **`HomePage`** is the old health-check UI (unchanged look); **`main.tsx`** uses **relative** `./lib/query-client` (not `@/`) so ESLint `import/order` and `simple-import-sort` agree on a single relative-import group.
- **RHF + Zod:** `src/lib/form-wiring.test.tsx` proves `zodResolver` + submit path (not production UI).
- **Verification:** `pnpm --filter @gorola/web test` (22 tests), `pnpm --filter @gorola/web lint` + `typecheck`, full repo **`pnpm ci:quality`** (API 277 + web 22 tests, builds).

**Session 33 (Phase 2.2 design tokens + shared components):**
- **CSS split:** `index.css` → `@import "./styles/globals.css"` only. **`globals.css`:** `@import` order — `./fonts.css` (Google Fonts + `--font-family-*` on `:root`), `./tokens.css` (Gorola `--gorola-*` hex on `:root`), then `tailwindcss` / `tw-animate` / `shadcn/tailwind.css`; **@theme** maps `--color-gorola-*` → `var(--gorola-*)` and **font-sans / font-serif** to family vars; keyframes and utility classes in **@layer components**; existing shadcn **`@theme inline` + `:root` / `.dark`** blocks preserved at end of `globals.css`.
- **Components (TDD):** `TopographicBg` (decorative SVG, `opacity` default `0.12`); `WeatherBanner` (pine vs slate from `useWeatherStore`, `data-weather` + `role="status"`); `ETABanner` (`.eta-pulse` on amber dot, static `etaLabel` prop for now). **`HomePage`:** “Design system — Phase 2.2 preview” section with the three for visual smoke-testing.
- **Tooling:** `WeatherBanner.test.tsx` needs **`eslint-disable simple-import-sort/imports, import/order`** (conflict between `import/order` and `@/` + `./` ordering).
- **Verify:** `pnpm ci:quality` (API 277, web 30, build).
