# GoRola — Current State

> **ALWAYS read this file first at the start of every session.**
> Update this file at the END of every session before closing Cursor.
> This is the single source of truth for where the project is right now.

---

## 📍 Last Updated

- **Date:** 2026-04-28
- **Session Summary:** **Phase 2.1 complete** — **React Router v6** + **TanStack Query** (`createAppQueryClient`, `staleTime: 60s`, `retry: 2`) + **Zustand** stores (`auth`, `cart`, `weather`, `feature-flags`) + **Axios** `src/lib/api.ts` (`createApiClient`, singleton `api` wired to `useAuthStore`, 401 → `POST /api/v1/auth/buyer/refresh` + one retry, `withCredentials: true`) + **RHF / resolvers / Zod**. **Vitest + RTL** in `apps/web` (`vitest.config.ts` merges `vite.config`, `src/test/setup.ts`), **22** web unit tests (TDD RED → GREEN per area). **Main** uses relative `./lib/query-client` import to satisfy ESLint import groups. **`pnpm ci:quality`** green (API 277 + web 22 tests).
- **Next Session Must Start With:** **Phase 2.2** design tokens / `globals.css` split, or **2.4** buyer layout + nav — or **API** `POST /api/v1/orders` → `OrderService`. Optional: `ThemeProvider` + `<Toaster />` for shadcn toasts.

---

## 🚦 Overall Phase Status

| Phase   | Name                 | Status         | Notes                                                                                                                                                |
| ------- | -------------------- | -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| Phase 1 | NFR Foundation       | ✅ COMPLETE    | 1.8 **CI+CD** in **`ci-cd.yml`** (Vercel + Railway on `main`, path-gated), 1.9 hosting config, **1.10** smoke + secrets. Optional: 1.8 coverage / branch rules in GitHub |
| Phase 2 | Buyer Web Experience | 🟡 IN PROGRESS | **2.1 complete** (router, query, stores, api, RHF+Zod, Vitest); next **2.2** / **2.4** or full product UX                                                                 |
| Phase 3 | Store Owner Panel    | 🔴 NOT STARTED | After Phase 2 complete                                                                                                                               |
| Phase 4 | Admin Panel          | 🔴 NOT STARTED | After Phase 3 complete                                                                                                                               |
| Phase 5 | Rider Interface      | ⏸️ DEFERRED    | Stubs only in Phase 1                                                                                                                                |

---

## ✅ Completed Tasks (Append only — never delete)

- **Session 1 (Phase 1.1 Setup):** Initialized `GoRola_app` monorepo structure and base tooling (pnpm workspace, strict TypeScript, ESLint flat config, Prettier, `.env.example`, dotenv-safe startup config, package scaffolding, local git init with `main`/`develop` branches).
- **Session 3 (Phase 1.3 User repository):** Vitest + Prisma integration tests for `UserRepository`; `getPrismaClient` singleton; `DATABASE_URL_TEST` documented in `.env.example`.
- **Session 4 (Phase 1.3 Store repository):** `StoreRepository` + `store.repository.test.ts` with full-store graph cleanup for isolated integration runs.
- **Session 5 (Phase 1.3 Store owner repository):** `StoreOwnerRepository` + `store-owner.repository.test.ts`; maps `P2003` to `NotFoundError` for invalid `storeId`.
- **Session 6 (Phase 1.3 Admin repository):** `AdminRepository` + `admin.repository.test.ts`; TDD RED (`TDD_RED` throws) then GREEN.
- **Session 7 (Phase 1.3 Catalog repositories):** `category.repository.ts`, `product.repository.ts`, `variant.repository.ts` (`ProductVariantRepository`) + matching integration tests; each preceded by RED run.
- **Session 8 (Phase 1.3 Cart repository):** `cart.repository.ts` + `cart.repository.test.ts`; TDD RED (`TDD_RED` throws) then GREEN with quantity validation and cart-item merge semantics.
- **Session 9 (Phase 1.3 Order repository):** `order.repository.ts` + `order.repository.test.ts`; TDD RED (`TDD_RED` throws) then GREEN with order-status history coverage.
- **Session 10 (Phase 1.3 Address repository):** `address.repository.ts` + `address.repository.test.ts`; TDD RED (`TDD_RED` throws) then GREEN with default-address switching.
- **Session 11 (Phase 1.3 Advertisement repository):** `advertisement.repository.ts` + `advertisement.repository.test.ts`; TDD RED (`TDD_RED` throws) then GREEN with time-window filtering.
- **Session 12 (Phase 1.3 Remaining repositories):** `offer.repository.ts`, `discount.repository.ts`, `feature-flag.repository.ts`, `audit.repository.ts`, and `delivery/rider.repository.ts` + integration tests; each followed RED-stub -> GREEN.
- **Session 13 (Phase 1.4 Bootstrap foundation):** Added strict-TDD integration tests for server bootstrap and implemented `server.ts` / `app.ts` + `lib/redis.ts`; health and error-envelope integration coverage now included.
- **Session 14 (Phase 1.4 completion hardening):** Added startup/listen and secure-cookie tests, implemented bootstrap hardening (`app.start.test.ts`, `server.bootstrap.test.ts`), and completed Phase 1.4 checklist items.
- **Session 15 (Phase 1.5 Buyer auth service):** Added tests-first buyer auth service suite, then implemented `auth.service.ts` (`sendOtp`, `verifyOtp`, `refreshToken`, `logout`) with Redis + token service flow.
- **Session 16 (Phase 1.5 Buyer auth controller + middleware):** Added tests-first auth controller/middleware suites, then implemented `auth.controller.ts`, `auth.middleware.ts`, and strict Zod parsing in `auth.schema.ts`.
- **Session 17 (Phase 1.5 Store owner auth service):** Added tests-first store-owner auth service suite, then implemented `store-owner-auth.service.ts` including login rate limit + optional 2FA flow.
- **Session 18 (Phase 1.5 Admin auth service):** Added tests-first admin auth service suite, then implemented `admin-auth.service.ts` with mandatory 2FA + rate limiting.
- **Session 19 (Phase 1.5 auth integration closure):** Added tests-first Store Owner/Admin auth route coverage in `auth.controller.test.ts`, then implemented matching route/schema wiring in `auth.controller.ts` and `auth.schema.ts`; full API suite now at 215 passing tests.
- **Session 20 (Phase 1.6 observability):** TDD: `lib/logger.ts`, `lib/telemetry.ts`, `server` request log hook + `pinoTestStream` test option, `server.request-logging.test.ts` + `telemetry.test.ts`, `app.ts` telemetry bootstrap; 224 API tests.
- **Session 21 (Phase 1.7 health check):** TDD: `lib/health.ts`, `lib/api-version.ts`, `CreateServerOptions.healthProbes` / `nowIso`, `health.scenarios.test.ts` + `health.test.ts`; 238 API tests.
- **Session 22 (Phase 1.8 CI, no deploy):** `.github/workflows/ci.yml` with service containers and full quality gate; deploy not added.
- **Session 23 (CI follow-up, no git):** Root scripts `ci:quality` and `ci:prisma`, workflow: `permissions`, `timeout-minutes`, stricter `pg_isready -U postgres`; local lint/typecheck/test/build verified.
- **Session 24 (1.8 checklist reconciliation):** Documented that **1.8 core CI is complete**; unchecked = deploy/optional coverage/branch settings; 1.10 “CI green” ticked; next focus 1.9.
- **Session 25 (1.9 Railway config, TDD):** `lib/entrypoint.ts` + `app.ts` main guard, `GoRola_app/railway.toml` + `Procfile`, `prisma` in API `dependencies`, build runs `prisma generate`; `railway.config.test.ts` + `entrypoint.test.ts` (248 API tests); manual Railway/Vercel still required.
- **Session 26 (1.10 production smoke):** Deployed API on Railway; fixed Redis `REDIS_URL` reference; public `/api/health` returns `status: "ok"` with DB + Redis ok; checklist **1.10** primary smoke row marked complete.
- **Session 27 (Phase 1.3 stock + order orchestration, TDD):** Added `StockMovement` model, CHECK `stockQty >= 0`, `stock-movement.repository.ts`, `ProductVariantRepository` stock helpers, `OrderService` placement/cancel with movements; `UnprocessableEntityError` in shared; `pnpm --filter @gorola/api prisma:migrate:test-db` for test DB; **277** API tests green.
- **Session 28 (1.9 Vercel live + API smoke from browser):** Vercel project deploys `apps/web` per `vercel.json`; production **`VITE_API_BASE_URL`** → Railway API; frontend calls **`GET /api/health`** — **`data.status: "ok"`**, HTTP 200 — confirms **CORS** and connectivity. `current_state` Important URLs updated.
- **Session 29 (Phase 1.10 + status text sync):** **1.10** was already complete in the checklist (all items [x]); **Overall Phase Status** and **In Progress** updated so Phase 1 reads **complete** and focus moves to **Phase 2**.
- **Session 30 (1.8 + monorepo doc — unified CI+CD):** `current_state` updated to match **`.github/workflows/ci-cd.yml`**: one workflow for **CI** + **path filters** + **Vercel** + **Railway** deploys; removed stale **`ci.yml` / `deploy.yml`** references in this file.
- **Session 31 (Phase 2.1 shadcn):** `pnpm dlx shadcn@latest init -t vite -y -b radix -p nova` in `apps/web` + add component set; lockfile updated (removed unused `@fontsource-variable/geist`); strict TS/ESLint fixes in generated `ui` files.
- **Session 32 (Phase 2.1 stack, TDD):** Router, Query, Zustand, `api.ts`, RHF+Zod, Vitest/RTL, `HomePage` + `App` routes; colocated `*.test.ts` / `*.test.tsx`.

---

## 🔨 In Progress Right Now

**Current Task:** **Phase 2.2+** — design tokens, buyer shell, catalog UX — or **order HTTP** on the API.

**Exact stopping point:** **2.1** checklist is [x] (incl. Vitest TDD for stores, `api`, query client, router smoke, RHF+Zod wiring). **`App`** renders **`/`** → `HomePage` (health `fetch` unchanged). **Next:** **2.2** (`tokens.css`, `fonts`, `globals`) or **2.4** `BuyerLayout` / nav.

---

## 📋 Phase 1 — NFR Foundation Checklist

### 1.1 — Monorepo Setup

- [x] `pnpm init` with workspaces
- [x] `pnpm-workspace.yaml` defining: `apps/api`, `apps/web`, `packages/shared`, `packages/ui`
- [x] Root `tsconfig.base.json` with strict settings
- [x] `apps/api/tsconfig.json` extends base
- [x] `apps/web/tsconfig.json` extends base
- [x] Root `eslint.config.ts` (flat config) with TypeScript rules + import ordering
- [x] Root `.prettierrc` with project settings
- [x] Root `.env.example` with all required variables (see project_data.json)
- [x] `dotenv-safe` configured to validate env on startup
- [x] `packages/shared/` — shared TypeScript types, Zod schemas, error classes
- [x] `packages/ui/` — shared React components (will be populated in Phase 2)
- [x] Git initialized, `.gitignore` configured (node_modules, .env, dist, coverage)
- [x] GitHub repo created, branch strategy set up (main, develop)

### 1.2 — Database Schema + Migrations

- [x] `apps/api/prisma/schema.prisma` created with ALL entities from project_data.json
- [x] Entity: User (buyer) — id, phone, name, isVerified, createdAt, updatedAt, isDeleted
- [x] Entity: Store — id, name, description, phone, address, isActive, weatherModeDeliveryWindow, createdAt, updatedAt, isDeleted
- [x] Entity: StoreOwner — id, email, passwordHash, storeId, totpSecret, totpEnabled, createdAt, updatedAt, isDeleted
- [x] Entity: Admin — id, email, passwordHash, totpSecret, createdAt, updatedAt, isDeleted
- [x] Entity: Category — id, slug, name, emoji, icon, displayOrder, isActive, createdAt, updatedAt
- [x] Entity: Product — id, storeId, categoryId, name, description, imageUrl, isActive, createdAt, updatedAt, isDeleted
- [x] Entity: ProductVariant — id, productId, label, price (Decimal), stockQty, unit, isActive, createdAt, updatedAt
- [x] Entity: Cart — id, userId, createdAt, updatedAt
- [x] Entity: CartItem — id, cartId, productVariantId, quantity, createdAt, updatedAt
- [x] Entity: Order — id, userId, storeId, status (enum), subtotal, deliveryFee, total, paymentMethod, deliveryNote, landmarkDescription, scheduledFor?, createdAt, updatedAt
- [x] Entity: OrderItem — id, orderId, productVariantId, productName, variantLabel, price, quantity
- [x] Entity: OrderStatusHistory — id, orderId, status, note, changedBy, changedAt
- [x] Entity: Address — id, userId, label, landmarkDescription, flatRoom?, lat?, lng?, isDefault, isDeleted, createdAt, updatedAt
- [x] Entity: Advertisement — id, storeId, title, imageUrl, linkUrl?, startsAt, endsAt, isApproved, isActive, createdAt, updatedAt
- [x] Entity: Offer — id, storeId, title, description, discountType (PERCENTAGE|FLAT), discountValue, minOrderAmount?, maxDiscount?, startsAt, endsAt, isActive, createdAt, updatedAt
- [x] Entity: Discount (coupon codes) — id, storeId?, code, discountType, discountValue, usageLimit?, usedCount, minOrderAmount?, startsAt, endsAt, isActive, createdAt, updatedAt
- [x] Entity: FeatureFlag — id, key, value (Boolean), description, updatedBy, updatedAt
- [x] Entity: OTPLog — id, phone, hashedOtp, attempts, expiresAt, createdAt (Redis, not DB — but schema here for reference)
- [x] Entity: AuditLog — id, actorId, actorRole, action, entityType, entityId, oldValue (Json?), newValue (Json?), ip, userAgent, createdAt (IMMUTABLE)
- [x] Entity: DeliveryRider (STUB) — id, name, phone, storeId, isActive, createdAt, updatedAt, isDeleted
- [x] Entity: RiderLocation (STUB) — id, riderId, lat, lng, updatedAt
- [x] All relations defined in Prisma schema
- [x] All indexes defined (foreign keys, search columns, compound indexes on common queries)
- [x] `prisma migrate dev --name init` — first migration created
- [x] Seed file: `prisma/seed.ts` — 2 stores, 2 store owners, categories (Groceries, Medical), sample products, feature flags
- [x] `npx prisma db seed` works successfully
- [x] Test database `gorola_test` created and migrated

### 1.3 — Repository Layer

- [x] `packages/shared/src/errors.ts` — AppError base class + all domain errors
  - [x] AppError, ValidationError, NotFoundError, UnauthorizedError, ForbiddenError, ConflictError, RateLimitError, NotImplementedError
- [x] `apps/api/src/modules/user/user.repository.ts`
  - [x] TESTS FIRST: findById, findByPhone, create, update, softDelete (all cases + edge + error)
  - [x] Implementation
- [x] `apps/api/src/modules/store/store.repository.ts`
  - [x] TESTS FIRST: findById, findAll (active), create, update (all cases)
  - [x] Implementation
- [x] `apps/api/src/modules/store-owner/store-owner.repository.ts`
  - [x] TESTS FIRST: findById, findByEmail, create, update (all cases)
  - [x] Implementation
- [x] `apps/api/src/modules/admin/admin.repository.ts`
  - [x] TESTS FIRST: findById, findByEmail, create (all cases) — RED stub then implementation
  - [x] Implementation
- [x] `apps/api/src/modules/catalog/category.repository.ts` + product.repository.ts + variant.repository.ts
  - [x] TESTS FIRST for each (RED stub → GREEN)
  - [x] Implementation
- [x] `apps/api/src/modules/cart/cart.repository.ts`
  - [x] TESTS FIRST: findByUserId, addItem, removeItem, updateQty, clearCart (RED stub -> GREEN)
  - [x] Implementation
- [x] `apps/api/src/modules/order/order.repository.ts`
  - [x] TESTS FIRST: create, findById, findByUserId, findByStoreId, updateStatus, addStatusHistory (RED stub -> GREEN)
  - [x] Implementation
- [x] `apps/api/src/modules/address/address.repository.ts`
  - [x] TESTS FIRST: findAllByUserId, findDefault, create, update, softDelete (RED stub -> GREEN)
  - [x] Implementation
- [x] `apps/api/src/modules/promotion/advertisement.repository.ts`
  - [x] TESTS FIRST: findActive, create, approve, deactivate (RED stub -> GREEN)
  - [x] Implementation
- [x] `apps/api/src/modules/promotion/offer.repository.ts` + discount.repository.ts
  - [x] TESTS FIRST
  - [x] Implementation
- [x] `apps/api/src/modules/feature-flag/feature-flag.repository.ts`
  - [x] TESTS FIRST: getAll, getByKey, update (RED stub -> GREEN)
  - [x] Implementation
- [x] `apps/api/src/modules/delivery/rider.repository.ts` (STUB — tests verify 501 behavior)
- [x] `apps/api/src/modules/audit/audit.repository.ts` — create (no update, no delete)
  - [x] TESTS FIRST
  - [x] Implementation

- [x] `apps/api/src/modules/inventory/stock-movement.repository.ts`
  - [x] TESTS FIRST:
    - [x] create: records movement with correct before/after quantities
    - [x] findByVariantId: returns movements in descending order
    - [x] findByOrderId: returns all movements for an order (for cancellation restore)
    - [x] happy path, edge case (zero qty movement rejected), security (variantId not owned by store)
  - [x] Implementation
- [x] DB constraint added in migration: `CHECK ("stockQty" >= 0)` on `ProductVariant` (see `20260423120000_add_stock_movements_and_non_negative_stock`)
- [x] ProductVariant repository updated: `decrementStock(variantId, qty, storeId, tx)` and `incrementStock(variantId, qty, storeId, tx)` methods added with TESTS FIRST

- [x] `apps/api/src/modules/order/order.service.ts` — stock deduction logic TESTS FIRST:
  - [x] should deduct stock for all items atomically on order placement
  - [x] should reject order with 422 and item list when any item is out of stock
  - [x] should reject order when requested qty exceeds available stock
  - [x] should NOT deduct stock if transaction fails (atomicity test — mock transaction rollback)
  - [x] should restore stock for all items when order is cancelled
  - [x] should record a SALE stock movement for each item on placement
  - [x] should record a CANCELLATION_RESTORE movement for each item on cancel
  - [x] edge case: two concurrent orders for the last 1 unit — only one should succeed

### 1.4 — Fastify Server Bootstrap

- [x] `apps/api/src/server.ts` — Fastify instance factory (not starting server, just creating instance)
- [x] `apps/api/src/app.ts` — Application entry point (imports server, starts listen)
- [x] Plugins registered in order:
  - [x] `@fastify/helmet` with CSP configuration
  - [x] `@fastify/cors` with CORS_ALLOWED_ORIGINS whitelist
  - [x] `@fastify/rate-limit` with Redis store
  - [x] `@fastify/cookie` with HttpOnly Secure settings
  - [x] `fastify-plugin` — request-id (UUID v4 per request, set in X-Request-ID header)
  - [x] Pino logger configured on Fastify instance
  - [x] Global error handler registered (formats ALL errors into response envelope)
  - [x] Prisma client singleton registered on Fastify instance
  - [x] Redis client registered on Fastify instance
- [x] Health route registered: GET /api/health
- [x] TESTS: server starts, health endpoint returns correct shape, error handler formats correctly

### 1.5 — Authentication System

- [x] `apps/api/src/modules/auth/` complete module

**Buyer OTP Flow:**

- [x] TESTS FIRST — auth.service.test.ts:
  - [x] sendOTP: sends OTP, hashes it, stores in Redis with TTL
  - [x] sendOTP: throws RateLimitError after 5 attempts in 15min
  - [x] sendOTP: throws ValidationError for invalid phone format
  - [x] verifyOTP: succeeds with correct OTP, returns tokens
  - [x] verifyOTP: throws error on wrong OTP (increments attempt counter)
  - [x] verifyOTP: throws error after 3 failed attempts (locks out)
  - [x] verifyOTP: throws error on expired OTP
  - [x] refreshToken: issues new access token + rotated refresh token
  - [x] refreshToken: throws on revoked refresh token
  - [x] logout: revokes refresh token in Redis
- [x] Implementation: auth.service.ts
- [x] Implementation: auth.controller.ts (POST /api/v1/auth/buyer/send-otp, /verify-otp, /refresh, /logout)
- [x] requireAuth middleware (verifies JWT, attaches req.user)
- [x] requireRole middleware (checks role against allowed roles)

**Store Owner Auth Flow:**

- [x] TESTS FIRST — store-owner-auth.service.test.ts:
  - [x] login: success with correct email/password (no 2FA yet)
  - [x] login: throws on wrong password (same message as wrong email — no enumeration)
  - [x] login: throws after 10 failed attempts in 15min
  - [x] setup2FA: generates TOTP secret, returns QR code URI
  - [x] verify2FA: enables 2FA on account with correct TOTP code
  - [x] login with 2FA: requires TOTP code when 2FA enabled
  - [x] login with 2FA: throws on wrong TOTP code
- [x] Implementation

**Admin Auth Flow:**

- [x] TESTS FIRST — same structure as store owner, but 2FA is mandatory
- [x] Implementation

### 1.6 — Observability Setup

- [x] Pino logger configured: JSON format in prod, pretty in dev, log level from env
- [x] Logger singleton exported from `apps/api/src/lib/logger.ts`
- [x] Request logging middleware (logs method, url, status, duration, requestId)
- [x] OpenTelemetry SDK initialized:
  - [x] Trace exporter: OTLP HTTP (to OTEL_EXPORTER_ENDPOINT) or console in dev
  - [x] Fastify instrumentation (auto-traces all routes)
  - [x] Prisma instrumentation (auto-traces all DB queries)
- [x] TESTS: logger is called with requestId, sensitive data masking works

### 1.7 — Health Check API

- [x] GET /api/health — implemented and tested
- [x] Checks: DB connection (simple SELECT 1), Redis ping
- [x] Returns correct status codes (200 ok, 200 degraded, 503 down)
- [x] TESTS: all 3 status scenarios

### 1.8 — GitHub Actions CI and CD

**Status:** **Complete.** The repo uses **one** workflow file: **`.github/workflows/ci-cd.yml`** (in `GoRola_app/`; working in production).

| Part | What it does |
| ---- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`ci`** | On every `push` / `pull_request` to `main` or `develop`, and `workflow_dispatch`: install, build `@gorola/shared`, wait for Postgres/Redis, Prisma `generate` + `migrate deploy` to test DB, **lint**, **typecheck**, **test**, **build**. Node **22**; service containers: **PostgreSQL 15** + **Redis 7** on `127.0.0.1` (not hostnames from compose). |
| **`paths`** | `dorny/paths-filter` — sets **`vercel`** / **`railway`** from changed paths (e.g. `apps/web/**` vs `apps/api/**`, plus shared root files in both so lockfile/tsconfig changes can trigger either side). |
| **`deploy-vercel`** | **After** `ci` succeeds; only **`main`**, on **push** or **`workflow_dispatch`**; runs if `paths` matched **or** `workflow_dispatch` (manual runs **both** deploys). `vercel deploy --prod` with `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`. |
| **`deploy-railway`** | Same gating; **`railway up --ci`** with `RAILWAY_TOKEN`, `RAILWAY_SERVICE_ID`. |

**Not deployed from Actions:** **pull requests** and **`develop`** — only `ci` (and `paths`); no production deploy. Details and secret names: **`GoRola_app/README.md`**.

- [x] **`.github/workflows/ci-cd.yml`** — full pipeline above (CI + path-filtered CD; verified working)
- [ ] Coverage report: uploaded to PR as comment _(optional enhancement)_
- [ ] Branch protection: CI must pass, 1 reviewer required _(configure in **GitHub → Settings → Branches**; not stored in this repo)_

### 1.9 — Railway Deployment

- [x] Railway project created with services: Node.js API, PostgreSQL 15, Redis 7
- [x] All environment variables set in Railway dashboard (see root `.env.example` and `project_data` — no secrets in repo)
- [x] `railway.toml` (monorepo root) + `Procfile` — Nixpacks `buildCommand` builds `@gorola/shared` then `@gorola/api`; `startCommand` = `pnpm --filter @gorola/api start` (which runs `prisma migrate deploy && node dist/app.js`; `node dist/app.js` **starts the server** via `isNodeMainModule` in `app.ts`)
- [x] **Build** (Railway) vs **start** (migrations + listen): `apps/api` `build` = `prisma generate && tsc`; `start` = migrate + `node dist/app.js` _(checklist’s old “build = migrate+node” line was split correctly to match Railway)_
- [x] Vercel project **deployed and linked** to this repo (`vercel.json` at monorepo root: install / build / `apps/web/dist`). Production **`VITE_API_BASE_URL`** = Railway API origin. **Vercel origin** added to Railway **`CORS_ALLOWED_ORIGINS`**. **Verified:** browser from Vercel URL → `GET /api/health` → `data.status: "ok"`.

### 1.10 — Smoke Test

- [x] Production `GET /api/health` (e.g. `https://gorolaapp-production.up.railway.app/api/health`) returns envelope with `data.status: "ok"` and DB + Redis checks `ok` _(verified after Railway deploy; `curl` equivalent OK)_
- [x] All CI checks passing on GitHub _(pipeline green on `main`/`develop` as of session)_
- [x] No secrets in any committed files (run: `git log --all -- '*/.env'` to verify)

---

## 📋 Phase 2 — Buyer Web Experience Checklist

_(Phase 1 is complete. Track Phase 2 items below; **2.1 is complete**.)_

### 2.1 — Vite + React Setup

- [x] `apps/web/` initialized: Vite + React + TypeScript (minimal shell; `pnpm --filter @gorola/web dev` / `build`)
- [x] Tailwind CSS v4 installed and configured (`@tailwindcss/vite` plugin)
- [x] shadcn/ui initialized (CLI: `init -t vite -y -b radix -p nova` — `components.json`, `src/components/ui/*`, `src/lib/utils.ts`, CSS vars + `shadcn/tailwind.css`)
- [x] shadcn components installed: button, card, input, dialog, drawer, sheet, skeleton, badge, sonner, scroll-area, separator, tabs, avatar, dropdown-menu
- [x] React Router v6 — `BrowserRouter` + `Routes` in `src/main.tsx` / `App.tsx` (`vitest` + `router.test.tsx`)
- [x] TanStack Query — `src/lib/query-client.ts` (`staleTime: 60_000`, `retry: 2`); `QueryClientProvider` in `main.tsx`
- [x] Zustand — `src/store/*.store.ts` + `*.store.test.ts` (auth, cart, weather, feature-flags)
- [x] React Hook Form + `@hookform/resolvers` + Zod — `form-wiring.test.tsx` (smoke)
- [x] Axios — `src/lib/api.ts` (`createApiClient`, `api` singleton from `VITE_API_BASE_URL`; bearer + 401 → buyer refresh + `clearSession` on failure) + `api.test.ts` (axios-mock-adapter)
- [x] `@gorola/shared` package linked as workspace dependency (for shared Zod schemas and types)
- [x] **Vitest** in `apps/web` — `pnpm --filter @gorola/web test` = `vitest run --config vitest.config.ts`

### 2.2 — Design Tokens + CSS

- [ ] `src/styles/tokens.css` — all GoRola CSS custom properties:
  - [ ] `--gorola-pine: #1D3D2F`, `--gorola-pine-dark: #162E23`, `--gorola-pine-light: #2D5A40`
  - [ ] `--gorola-saffron: #E8833A`, `--gorola-fog: #F4F1EC`, `--gorola-charcoal: #1C1C1E`
  - [ ] `--gorola-amber: #F5A623`, `--gorola-slate: #3A4A5C`, `--gorola-slate-mist: #E8ECF0`
- [ ] `src/styles/fonts.css` — Google Fonts import: Playfair Display, DM Sans, Noto Sans Devanagari
- [ ] Utility classes: `.font-playfair`, `.font-dm-sans`, `.font-devanagari`
- [ ] Animation keyframes: `etaPulse`, `riderPing`, `greenBloom`, `fadeInUp`, `fogDrift`, `shimmer`
- [ ] Utility classes: `.eta-pulse`, `.fade-in-up`, `.fog-drift`, `.skeleton`, `.noise-overlay`
- [ ] `src/styles/globals.css` — Tailwind directives + import tokens + import fonts
- [ ] `TopographicBg` shared component (`src/components/shared/TopographicBg.tsx`) — SVG topo lines, accepts opacity prop
- [ ] `WeatherBanner` shared component — renders pine or slate banner depending on weather mode state
- [ ] `ETABanner` shared component — amber pulse banner with live ETA from API

### 2.3 — Lenis + GSAP Setup

- [ ] `gsap` + `@gsap/react` installed. `ScrollTrigger` registered globally.
- [ ] `lenis` installed
- [ ] `src/lib/lenis.ts` — Lenis singleton, exported `lenis` instance
- [ ] `src/lib/gsap.ts` — GSAP defaults set (`gsap.defaults({ ease: 'power2.out', duration: 0.8 }`), ScrollTrigger registered, Lenis RAF loop synced to GSAP ticker
- [ ] Both initialized once in `src/App.tsx` via `useEffect` on mount
- [ ] Lenis `destroy()` called in cleanup
- [ ] TESTS: GSAP context cleanup doesn't leak between component mount/unmount cycles (Vitest + jsdom)

### 2.4 — App Shell + Routing

- [ ] `src/App.tsx` — sets up React Router, Lenis, GSAP, QueryClientProvider, Toaster (sonner)
- [ ] Route guards: `ProtectedRoute` (redirects to /login if no auth), `StoreRoute` (requires STORE_OWNER role), `AdminRoute` (requires ADMIN role)
- [ ] `BuyerLayout` — shared layout for buyer pages: sticky nav, main content, footer
- [ ] `BuyerNav` component:
  - [ ] GoRola mountain logo (inline SVG, from design system)
  - [ ] Location pill (current delivery area — "Kulri, Mussoorie")
  - [ ] Search bar (links to /search on enter)
  - [ ] Cart button with item count badge
  - [ ] Login/Profile button
  - [ ] Weather mode: nav background shifts from `--gorola-pine` to `--gorola-slate`
- [ ] `BuyerFooter` component — minimal, pine background, links
- [ ] TESTS: route guard redirects unauthenticated users, role guard redirects wrong role

### 2.5 — Hero Section

- [ ] `src/pages/buyer/HomePage.tsx` created
- [ ] `src/components/buyer/HeroSection.tsx`:
  - [ ] Full-viewport height section
  - [ ] Background: `--gorola-pine` with `TopographicBg` overlay (opacity 0.12)
  - [ ] Noise texture overlay (`.noise-overlay`)
  - [ ] GSAP timeline on mount (use `gsap.context()` + ref):
    - [ ] Logo SVG: scale from 0.8 + opacity 0 → 1 (0.6s)
    - [ ] "GoRola" wordmark (Playfair Display): `y: 30` → 0 + opacity (0.5s, delay 0.3s)
    - [ ] Tagline "Mussoorie, delivered." (DM Sans): `y: 20` → 0 + opacity (0.4s, delay 0.6s)
    - [ ] CTA button: `y: 15` → 0 + opacity (0.3s, delay 0.8s)
    - [ ] ETA banner: slide in from bottom (0.4s, delay 1.0s)
  - [ ] GSAP cleanup: `return () => ctx.revert()` in useEffect
  - [ ] Normal mode: amber ETA banner with pulse animation
  - [ ] Weather mode: slate banner, calm copy ("Fog tonight — we're still coming")
  - [ ] CTA button: pill shape, `--gorola-saffron` background, "Shop Now" → scrolls to categories
- [ ] TESTS: hero renders in both normal and weather mode, GSAP cleanup runs on unmount

### 2.6 — Category Section

- [ ] `src/components/buyer/CategoryGrid.tsx`:
  - [ ] Fetches categories from `GET /api/v1/categories` (TanStack Query)
  - [ ] V1 renders: Groceries, Medical (only these two from API)
  - [ ] Card layout: emoji icon, category name, product count
  - [ ] Loading state: skeleton cards matching real card dimensions
  - [ ] Empty state: "No categories available" (shouldn't happen but must handle)
  - [ ] Error state: "Couldn't load categories — tap to retry"
  - [ ] GSAP ScrollTrigger: cards stagger-fade-up when section enters viewport
  - [ ] Hover: subtle lift (translateY -4px) + shadow increase (CSS transition, not GSAP)
  - [ ] Click → navigate to `/categories/:slug`
- [ ] TESTS: renders correct categories, loading/empty/error states, navigation on click

### 2.7 — Product Listing Page

- [ ] `src/pages/buyer/CategoryPage.tsx` → route: `/categories/:slug`
- [ ] `src/components/buyer/ProductGrid.tsx`:
  - [ ] Fetches `GET /api/v1/products?categoryId=&storeId=&search=&cursor=&limit=20`
  - [ ] Product card: product name, shop name, price (largest variant), weight/unit, "Add" button
  - [ ] Infinite scroll: `useInfiniteQuery` + intersection observer on last card
  - [ ] Loading: skeleton cards (3 rows of 4)
  - [ ] Empty state: "Nothing here yet — check back soon"
  - [ ] Error state: retry button
  - [ ] Search bar at top: debounced 300ms, updates query param
  - [ ] "Add" button: optimistic update — immediately increments cart count, POST to API in background
  - [ ] If item already in cart: show quantity +/- controls instead of "Add"
  - [ ] GSAP ScrollTrigger: new cards fade-up as they enter viewport on infinite load
- [ ] TESTS: renders product list, pagination loads next page, add-to-cart optimistic update, search debounce

### 2.8 — Product Detail Page

- [ ] `src/pages/buyer/ProductDetailPage.tsx` → route: `/products/:id`
- [ ] Fetches `GET /api/v1/products/:id` (includes variants)
- [ ] Large product name (Playfair Display), shop name with phone number
- [ ] Variant selector: if multiple variants (e.g. 500ml / 1L), show pills
- [ ] Price: updates based on selected variant
- [ ] Quantity selector: +/- buttons, min 1, max based on stockQty
- [ ] "Add to Cart" CTA: pill button, saffron, full width on mobile
- [ ] Loading: skeleton matching page layout
- [ ] GSAP: page entry animation — content slides up on load
- [ ] TESTS: variant selection updates price, add to cart calls API with correct variantId + quantity

### 2.9 — Cart (Drawer on Mobile, Sidebar on Desktop)

- [ ] `src/components/buyer/CartDrawer.tsx` (mobile: bottom drawer, desktop: right sidebar)
  - [ ] Triggered by cart icon in nav
  - [ ] Lists cart items with quantity controls
  - [ ] Per-item: product name, variant, price × qty, remove button
  - [ ] Subtotal calculation
  - [ ] Delivery fee (fetched from store config or flat rate from API)
  - [ ] Active offers/discounts section: if store has active offers, show prominently
  - [ ] Discount code input field + "Apply" button → `POST /api/v1/promotions/discounts/validate`
  - [ ] If discount valid: show amount saved, update total
  - [ ] Payment method selector: COD (pre-selected, green checkmark animation), UPI (flag-gated), Card (flag-gated)
  - [ ] "Proceed to Checkout" CTA (disabled if cart empty)
  - [ ] Empty state: "Your cart is empty — go find something good"
- [ ] TESTS: item removal, quantity update, discount code validation (valid/invalid/expired), payment method selection, empty state

### 2.10 — OTP Login Flow

- [ ] `src/pages/buyer/LoginPage.tsx` → route: `/login`
- [ ] Step 1: Phone number input (E.164 format validation, India +91 prefix)
  - [ ] Zod validation: must be 10 digits after +91
  - [ ] Submit → `POST /api/v1/auth/buyer/send-otp`
  - [ ] Error states: invalid format, rate limit hit ("Too many attempts — try in 15 minutes")
  - [ ] Loading state on button
- [ ] Step 2: OTP input (6-digit, auto-focus, auto-advance between digits)
  - [ ] Countdown timer showing OTP expiry (5:00 → 0:00)
  - [ ] "Resend OTP" button (disabled until timer expires)
  - [ ] Submit → `POST /api/v1/auth/buyer/verify-otp`
  - [ ] Error: wrong OTP, attempts remaining shown ("2 attempts left")
  - [ ] Error: too many failed attempts (lockout message)
  - [ ] Success: redirect to previous page or `/`
  - [ ] GSAP: smooth transition between step 1 and step 2
- [ ] Auth store updated on success: `{ userId, name, phone, accessToken }`
- [ ] TESTS: phone validation, OTP input behavior, timer countdown, resend logic, success redirect, error states

### 2.11 — Address Entry

- [ ] `src/pages/buyer/CheckoutPage.tsx` → route: `/checkout`
- [ ] Step 1 — Address:
  - [ ] If user has saved addresses: show list, allow select
  - [ ] "Use a new address" option always available
  - [ ] New address form:
    - [ ] Landmark description (required, min 10 chars, placeholder: "E.g. — near the red gate, behind Hotel Padmini")
    - [ ] Flat/room number (optional)
    - [ ] NO pin code field (ever)
    - [ ] "Save this address" checkbox
  - [ ] Optional: draggable map pin (Leaflet.js, OpenStreetMap tiles — free) to capture lat/lng
- [ ] Step 2 — Review Order: items, subtotal, delivery fee, discount, total, payment method
- [ ] Step 3 — Place Order button → `POST /api/v1/orders`
- [ ] TESTS: landmark validation (required, min length), no pin code field present, order placement with saved vs new address

### 2.12 — Order Confirmation Page

- [ ] `src/pages/buyer/OrderConfirmationPage.tsx` → route: `/orders/:id`
- [ ] On load: fetch `GET /api/v1/orders/:id`
- [ ] GSAP: `greenBloom` animation — full screen warm green flash → fades to white → content appears
- [ ] Large checkmark (SVG animated with GSAP drawSVG or stroke-dashoffset trick)
- [ ] Order summary: items, total, payment method, estimated delivery
- [ ] Rider trust block: "Your order from [Store Name] is being prepared. [Store Owner Name] will call if needed." + one-tap call button
- [ ] ETA countdown (amber pulse banner) — updates via Socket.IO `order_status_changed` event
- [ ] Weather mode variant: "Roads are foggy tonight. Your order will arrive between [time window]. We'll notify you."
- [ ] Honest copy — no fake urgency
- [ ] TESTS: renders with correct order data, Socket.IO status update reflects in UI, weather mode variant

### 2.13 — Order Status Page (for post-confirmation tracking)

- [ ] Status timeline: PLACED → PREPARING → OUT_FOR_DELIVERY → DELIVERED (visual stepper)
- [ ] Current status highlighted, timestamps for completed steps
- [ ] Store contact info visible at all times
- [ ] "Need help?" — store phone number, one-tap call
- [ ] Rider location: STUB — shows "Your rider is on the way" (no live GPS in v1), real-time stub ready for Phase 5
- [ ] Socket.IO: subscribes to `order:{orderId}` room, updates timeline on `order_status_changed`
- [ ] TESTS: status timeline renders all states correctly, Socket.IO event updates UI

### 2.14 — Saved Addresses Page

- [ ] `src/pages/buyer/SavedAddressesPage.tsx` → route: `/account/addresses`
- [ ] Lists all saved addresses with landmark description
- [ ] Edit, delete (soft), set as default
- [ ] TESTS: renders addresses, edit/delete/default flows

### 2.15 — Order History + Reorder

- [ ] `src/pages/buyer/OrderHistoryPage.tsx` → route: `/account/orders`
- [ ] Lists past orders: store name, items summary, total, date, status
- [ ] "Reorder" button: `POST /api/v1/orders/:id/reorder` — re-adds all items to cart, navigates to cart
- [ ] Thumbs up / thumbs down rating (no stars): `PUT /api/v1/orders/:id/rate`
- [ ] TESTS: reorder adds items to cart, rating submission

### 2.16 — Weather Mode (System-Wide Toggle)

- [ ] `weatherMode` boolean in Zustand weather store
- [ ] Fetched from `GET /api/v1/feature-flags/WEATHER_MODE_ACTIVE` on app load (refetched every 60s)
- [ ] When `weatherMode = true`:
  - [ ] Body background class: `weather-mode` (changes `--bg` to `--gorola-slate-mist`)
  - [ ] Nav background: `--gorola-slate`
  - [ ] ETA banner: slate blue, "Scheduled deliveries only tonight"
  - [ ] Hero: alternate copy and color scheme
  - [ ] All amber accent elements shift to slate-blue
- [ ] Transition: smooth CSS var transition (0.6s ease) — not jarring
- [ ] TESTS: weather mode state changes CSS variables, all affected components re-render correctly

### 2.17 — Advertisements Display

- [ ] `src/components/buyer/AdvertisementBanner.tsx`
  - [ ] Fetches `GET /api/v1/promotions/advertisements` (only approved, active, within date range)
  - [ ] Carousel (Embla carousel) for multiple ads
  - [ ] Shown on home page between categories and featured products
  - [ ] Each ad: image, optional link
  - [ ] Auto-advance every 5s, pause on hover
- [ ] TESTS: renders active ads, skips unapproved/expired, carousel navigation

### 2.18 — E2E Tests (Playwright)

- [ ] `tests/e2e/buyer-journey.spec.ts`:
  - [ ] Browse home page → categories load
  - [ ] Navigate to Groceries → product list loads
  - [ ] Add product to cart → cart count increments
  - [ ] Open cart → item visible
  - [ ] Remove item → cart updates
  - [ ] Login flow → OTP step 1 → step 2 (mock OTP in test)
  - [ ] Checkout → address entry → place order → confirmation page
  - [ ] Order history → reorder
- [ ] Weather mode E2E: admin toggles flag → buyer UI shifts

---

## 📋 Phase 3 — Store Owner Panel Checklist

_(Detailed checklist to be filled in when Phase 2 is 100% complete)_

### 3.1 — Store Auth (Email + TOTP 2FA)

- [ ] `src/pages/store/StoreLoginPage.tsx` → route: `/store/login`
  - [ ] Email + password form (Zod validation)
  - [ ] Submits `POST /api/v1/auth/store/login`
  - [ ] If 2FA enabled: redirect to `/store/2fa` for TOTP code entry
  - [ ] Error states: wrong credentials (generic message — no enumeration), account locked after 10 attempts
- [ ] `src/pages/store/StoreTwoFactorPage.tsx` → route: `/store/2fa`
  - [ ] 6-digit TOTP input (auto-focus, digit-by-digit)
  - [ ] Submits `POST /api/v1/auth/store/verify-2fa`
  - [ ] Error: wrong code, rate limit
- [ ] `src/pages/store/StoreSetup2FAPage.tsx` → route: `/store/setup-2fa`
  - [ ] Shows QR code URI rendered as QR image (use `qrcode.react`)
  - [ ] Manual entry key shown below QR
  - [ ] Verification step: enter current TOTP code to confirm setup
  - [ ] `POST /api/v1/auth/store/setup-2fa` → `POST /api/v1/auth/store/verify-2fa`
- [ ] `StoreLayout` — sidebar nav, main content area
- [ ] `StoreNav` sidebar items: Dashboard, Orders, Products, Advertisements, Offers & Discounts, Settings
- [ ] TESTS: login flow, 2FA flow, locked account behavior, wrong TOTP code

### 3.2 — Store Dashboard

- [ ] `src/pages/store/StoreDashboardPage.tsx` → route: `/store/dashboard`
- [ ] Fetches `GET /api/v1/store/dashboard`:
  - [ ] Today's orders count and revenue
  - [ ] Pending orders count (badge, highlighted if > 0)
  - [ ] Weekly revenue chart (Recharts bar chart, GoRola colors)
  - [ ] Top 5 products this week (by units sold)
  - [ ] Active advertisements count
  - [ ] Active offers count
- [ ] Pending orders alert: if any orders in PLACED status > 10 mins, show amber alert
- [ ] Weather mode indicator: shows current weather mode state + toggle link to admin (read-only for store)
- [ ] Auto-refresh every 30s (TanStack Query `refetchInterval: 30000`)
- [ ] Loading: skeleton matching dashboard layout
- [ ] TESTS: dashboard data renders, pending order alert triggers, auto-refresh, skeleton states

### 3.3 — Incoming Order Management

- [ ] `src/pages/store/StoreOrdersPage.tsx` → route: `/store/orders`
- [ ] Tabs: Pending | Preparing | Out for Delivery | Delivered (today) | All
- [ ] Order card:
  - [ ] Order ID (short), timestamp, buyer first name, landmark description
  - [ ] Items list (name, qty, variant)
  - [ ] Total amount, payment method (COD badge)
  - [ ] Action buttons per status:
    - [ ] PLACED: "Accept & Prepare" (→ PREPARING) + "Cancel" button
    - [ ] PREPARING: "Mark as Out for Delivery" (→ OUT_FOR_DELIVERY)
    - [ ] OUT_FOR_DELIVERY: "Mark as Delivered" (→ DELIVERED)
  - [ ] All status changes: `PUT /api/v1/store/orders/:id/status { status, note? }`
- [ ] Socket.IO: subscribes to `store:{storeId}` room, `new_order` event shows a toast + adds to pending list with animation
- [ ] New order sound notification: short audio ping (user must interact with page first — browser autoplay policy)
- [ ] TESTS: status transitions, Socket.IO new order toast, cancel flow, all tab filters

### 3.4 — Product Management

- [ ] `src/pages/store/StoreProductsPage.tsx` → route: `/store/products`
- [ ] List all store products with status (active/inactive), stock, price
- [ ] "Add Product" button → opens drawer/dialog
- [ ] Product form (`src/components/store/ProductForm.tsx`):
  - [ ] Name (required), description, category (dropdown — only active categories), image upload
  - [ ] Image upload: client-side resize to max 1200px, Cloudinary or API multipart upload
  - [ ] Variants section (at least one required):
    - [ ] Label (e.g. "500ml", "1kg"), price (Decimal, min 0.01), stock quantity, unit
    - [ ] "Add another variant" button
    - [ ] Variant delete (only if no order items reference it — API enforces)
  - [ ] Active/inactive toggle
- [ ] Edit product: same form, pre-populated
- [ ] Soft delete: "Archive Product" — sets isDeleted, removes from buyer catalog
- [ ] Zod validation on all fields, errors shown inline
- [ ] `PUT /api/v1/store/products/:id/variants/:variantId` — stock update (quick inline edit in list view)
- [ ] TESTS: form validation (all fields), image upload, variant add/remove, soft delete, stock update

### 3.5 — Advertisement Management

- [ ] `src/pages/store/StoreAdvertisementsPage.tsx` → route: `/store/promotions/advertisements`
- [ ] List: title, image preview, status (Pending Approval / Approved / Rejected / Expired), date range
- [ ] Create ad form:
  - [ ] Title (required), image upload (required, max 2MB, jpg/png/webp)
  - [ ] Optional: link URL (validated as https URL)
  - [ ] Start date + End date (date picker, start must be before end, end must be future)
- [ ] After submit: status = "Pending Approval" — admin must approve before it shows to buyers
- [ ] Cannot edit after submission (must delete and recreate)
- [ ] Cannot delete an approved active ad (must deactivate first via admin)
- [ ] Status badge with color: Pending (amber), Approved (green), Rejected (red), Expired (gray)
- [ ] TESTS: form validation, date range validation, status display, pending vs approved state

### 3.6 — Offers Management

- [ ] `src/pages/store/StoreOffersPage.tsx` → route: `/store/promotions/offers`
- [ ] List active and past offers
- [ ] Create offer form:
  - [ ] Title (required), description
  - [ ] Discount type: Percentage | Flat Amount (radio)
  - [ ] Discount value (required, min 1. If percentage: max 90)
  - [ ] Min order amount (optional)
  - [ ] Max discount cap (optional, only for percentage type)
  - [ ] Start date + End date (required, same rules as ads)
  - [ ] Active toggle
- [ ] Edit offer (if not yet started — once active, only deactivation allowed)
- [ ] TESTS: percentage vs flat type, max cap logic, date validation, edit restriction after activation

### 3.7 — Discount / Coupon Code Management

- [ ] `src/pages/store/StoreDiscountsPage.tsx` → route: `/store/promotions/discounts`
- [ ] List discount codes with: code, type, value, usage count/limit, status
- [ ] Create discount code form:
  - [ ] Code (required, uppercase, alphanumeric, 4-12 chars, no spaces — enforced by Zod)
  - [ ] Discount type + value (same as offers)
  - [ ] Usage limit (optional — unlimited if blank)
  - [ ] Min order amount (optional)
  - [ ] Start + End date
  - [ ] Scope: store-specific (always in store panel — storeId auto-attached)
- [ ] "Generate random code" button — generates 8-char alphanumeric
- [ ] Deactivate code button (sets isActive=false)
- [ ] TESTS: code format validation, usage limit enforcement (checked in order service), deactivation

### 3.8 — Store Settings

- [ ] `src/pages/store/StoreSettingsPage.tsx` → route: `/store/settings`
- [ ] Store info: name, description, phone, address/landmark (edit)
- [ ] Weather mode delivery window: text field for store owner to configure their scheduled window (e.g. "9:00–10:30 PM")
- [ ] Change password form (current + new + confirm, all Zod-validated)
- [ ] 2FA setup/disable (if already set up, show "Disable 2FA" with TOTP confirmation)
- [ ] TESTS: profile update, password change validation, 2FA setup/disable flow

### 3.9 — Inventory Management UI

- [ ] Stock status visible on product list page (3.4):
  - [ ] Each variant row shows current stock qty prominently
  - [ ] Color coding: green (> lowStockThreshold), amber (≤ lowStockThreshold, > 0), red (0 — Out of Stock)
  - [ ] isInStock badge on product card

- [ ] Quick restock inline on product list:
  - [ ] "+Stock" button per variant row → inline input: "Add quantity" + optional note
  - [ ] Submits `PUT /api/v1/store/products/:id/variants/:variantId/stock`
  - [ ] Optimistic UI update, reverts on API error
  - [ ] TESTS: restock adds to current qty, creates REFILL movement, isInStock flips true when restocking from 0

- [ ] Manual adjustment (full recount):
  - [ ] "Adjust Stock" option per variant → modal: "Set stock to" absolute value + required reason field
  - [ ] Submits `PUT /api/v1/store/products/:id/variants/:variantId/stock/adjust`
  - [ ] TESTS: sets absolute value (not delta), creates ADJUSTMENT movement, reason required

- [ ] Low stock alert section on store dashboard (3.2):
  - [ ] Card: "Low Stock Items" — lists all variants with isLowStock = true
  - [ ] Each item: product name, variant label, current qty, lowStockThreshold
  - [ ] Quick restock button inline (same flow as above)
  - [ ] TESTS: alert shows when isLowStock=true, disappears after restock above threshold

- [ ] Out of stock banner on buyer product card:
  - [ ] When all variants isInStock=false: product card shows "Out of Stock" overlay
  - [ ] "Add" button disabled
  - [ ] Product is still visible (not hidden) — buyer knows it exists but can't order
  - [ ] TESTS: disabled add button, overlay renders, no API call on click attempt

- [ ] Stock Movement History page:
  - [ ] Route: `/store/products/:id/stock-history`
  - [ ] Table: date, type (SALE/REFILL/ADJUSTMENT/CANCELLATION_RESTORE), change (+/-), qty before, qty after, reference (order ID or "Manual"), note
  - [ ] Filter by variant (if product has multiple variants)
  - [ ] Filter by movement type
  - [ ] Read-only — no edits
  - [ ] TESTS: all movement types display, filter by type, order link navigates to order detail

- [ ] Low stock threshold configuration per variant:
  - [ ] In product edit form (3.4): "Low stock alert at" field per variant (default 5, min 1)
  - [ ] Submits as part of variant update `PUT /api/v1/store/products/:id/variants/:variantId`
  - [ ] TESTS: threshold update reflects in low-stock check logic

---

## 📋 Phase 4 — Admin Panel Checklist

_(Detailed checklist to be filled in when Phase 3 is 100% complete)_

### 4.1 — Admin Auth (Email + Mandatory TOTP 2FA)

- [ ] `src/pages/admin/AdminLoginPage.tsx` → route: `/admin/login`
  - [ ] Email + password → `POST /api/v1/auth/admin/login`
  - [ ] Always redirects to 2FA step (mandatory — cannot skip)
  - [ ] Lock after 10 failed password attempts (account must be unlocked from DB — no self-service)
- [ ] `src/pages/admin/AdminTwoFactorPage.tsx` → route: `/admin/2fa`
  - [ ] TOTP input, same UX as store 2FA
  - [ ] If admin account has no TOTP set up yet: force through setup flow before accessing any admin page
- [ ] `src/pages/admin/AdminSetup2FAPage.tsx` — same as store setup but mandatory (cannot skip)
- [ ] `AdminLayout` — top nav + sidebar (different from store layout)
- [ ] `AdminGuard` route wrapper: requires ADMIN role + 2FA verified flag in session
- [ ] TESTS: 2FA cannot be skipped, lock after 10 attempts, no self-service unlock

### 4.2 — Admin Dashboard (All-Stores Overview)

- [ ] `src/pages/admin/AdminDashboardPage.tsx` → route: `/admin/dashboard`
- [ ] Fetches `GET /api/v1/admin/dashboard`:
  - [ ] Total orders today (across all stores), total revenue today
  - [ ] Per-store breakdown: orders, revenue, pending orders count
  - [ ] Platform-wide weekly revenue chart (Recharts, stacked bar by store)
  - [ ] Platform-wide low stock alert count (across all stores)
  - [ ] Total active buyers (users with at least one order)
  - [ ] Total products across all stores
  - [ ] Any pending advertisement approvals (badge)
  - [ ] Current feature flags status (quick view)
- [ ] Weather Mode active indicator (with quick toggle button — see 4.7)
- [ ] TESTS: all metrics render, per-store breakdown, pending approvals count

### 4.3 — All-Orders View

- [ ] `src/pages/admin/AdminOrdersPage.tsx` → route: `/admin/orders`
- [ ] Table: Order ID, Buyer (masked phone), Store, Items count, Total, Status, Created at, Payment method
- [ ] Filters: by store, by status, by date range, by payment method
- [ ] When an order is force-cancelled by admin, stock restoration is triggered (same cancellation flow)
- [ ] Cursor-based pagination (50 per page)
- [ ] Click row → order detail modal:
  - [ ] Full order details (items, prices, address, landmark)
  - [ ] Status history timeline
  - [ ] Admin can force-update status if needed (with required audit note)
- [ ] Export to CSV button: current filtered view (max 1000 rows)
- [ ] TESTS: filters work, pagination, force-status update creates audit log entry, CSV export

### 4.4 — User Management (Buyers)

- [ ] `src/pages/admin/AdminUsersPage.tsx` → route: `/admin/users`
- [ ] Table: masked phone, name, order count, total spent, created at, status (active/suspended)
- [ ] Search by phone (partial match, shows masked)
- [ ] User detail drawer: order history, addresses (masked), account status
- [ ] Suspend/unsuspend account (sets user.isActive — suspended users get 403 on login)
- [ ] All actions create audit log entries
- [ ] TESTS: search, suspend/unsuspend, audit log created on each action

### 4.5 — Store Management

- [ ] `src/pages/admin/AdminStoresPage.tsx` → route: `/admin/stores`
- [ ] Table: store name, owner email, order count (all time), revenue (all time), product count, status
- [ ] "Add Store" form:
  - [ ] Store name, description, phone, landmark address
  - [ ] Store owner email + temporary password (sent via email — stub for v1: shown on screen)
  - [ ] Weather mode delivery window config
- [ ] Stock movement history tab for the entire store (all products/variants)
- [ ] Store detail page → route: `/admin/stores/:id`
  - [ ] All store orders, products, revenue chart, advertisements, offers
  - [ ] Suspend store toggle (all store products hidden from buyers, new orders blocked)
  - [ ] Store owner management (reset password, enable/disable 2FA for owner account)
- [ ] TESTS: add store creates store + store owner in transaction, suspend hides products from buyer API

### 4.6 — Category Management

- [ ] `src/pages/admin/AdminCategoriesPage.tsx` → route: `/admin/categories`
- [ ] Table: name, emoji, slug, display order, product count, active status
- [ ] Add/edit category: name, emoji picker, slug (auto-generated from name, editable), display order
- [ ] Active/inactive toggle (inactive categories hidden from buyer catalog)
- [ ] Cannot delete category that has products (API enforces: 409 Conflict)
- [ ] Drag-to-reorder display order (dnd-kit)
- [ ] TESTS: add category, auto-slug generation, display order reorder, cannot delete with products

### 4.7 — Feature Flag Management

- [ ] `src/pages/admin/AdminFeatureFlagsPage.tsx` → route: `/admin/feature-flags`
- [ ] Table of all flags with description and current value
- [ ] Toggle switch per flag (updates `PUT /api/v1/admin/feature-flags/:key`)
- [ ] Confirmation modal for high-impact flags: WEATHER_MODE_ACTIVE, RIDER_INTERFACE_ENABLED
- [ ] Change is reflected in Redis cache within 60 seconds (shown as note in UI)
- [ ] Every flag change creates audit log entry
- [ ] WEATHER_MODE_ACTIVE toggle: shows a confirmation with weather mode impact summary
- [ ] TESTS: toggle creates audit log, confirmation modal for high-impact flags, Redis cache invalidation on update

### 4.8 — Advertisement Approval Queue

- [ ] `src/pages/admin/AdminAdvertisementsPage.tsx` → route: `/admin/advertisements`
- [ ] Tabs: Pending Approval | Approved | All
- [ ] Pending queue: shows ad image preview, title, store name, date range, submitted at
- [ ] "Approve" button → `PUT /api/v1/admin/advertisements/:id/approve`
- [ ] "Reject" button → rejection reason text field required → `PUT /api/v1/admin/advertisements/:id/reject`
- [ ] Approved ads: can deactivate (`PUT /api/v1/admin/advertisements/:id/deactivate`)
- [ ] All actions create audit log entries
- [ ] TESTS: approve/reject flows, rejection reason required, deactivation, audit log

### 4.9 — Audit Log Viewer

- [ ] `src/pages/admin/AdminAuditLogsPage.tsx` → route: `/admin/audit-logs`
- [ ] Table: timestamp, actor (masked), role, action, entity type, entity ID, IP (masked to /24)
- [ ] Filters: by actor role, by action, by entity type, by date range
- [ ] Expandable row: shows oldValue and newValue JSON diff (simple JSON viewer component)
- [ ] Read-only — no edit/delete actions anywhere on this page
- [ ] Export to CSV (current filtered view, max 1000 rows)
- [ ] TESTS: read-only (no mutation buttons), filters, JSON diff display

### 4.10 — Admin E2E Tests (Playwright)

- [ ] `tests/e2e/admin-journey.spec.ts`:
  - [ ] Login → 2FA → dashboard loads
  - [ ] Toggle WEATHER_MODE_ACTIVE → buyer home page reflects change
  - [ ] Approve advertisement → appears on buyer home page
  - [ ] Add new store → store owner can login with provided credentials
  - [ ] Audit log shows all above actions

---

## 🐛 Known Issues & Blockers

_(None yet)_

---

## 🔑 Environment & Keys Status

| Variable               | Status           | Notes                                                                                       |
| ---------------------- | ---------------- | ------------------------------------------------------------------------------------------- |
| DATABASE_URL           | ❌ Not set       | Railway will provide                                                                        |
| REDIS_URL              | ❌ Not set       | Railway will provide                                                                        |
| JWT_PRIVATE_KEY        | ❌ Not generated | Run: openssl genrsa -out private.pem 2048                                                   |
| JWT_PUBLIC_KEY         | ❌ Not generated | Run: openssl rsa -in private.pem -pubout -out public.pem                                    |
| FAST2SMS_API_KEY       | ❌ Not set       | Sign up at fast2sms.com                                                                     |
| RAZORPAY_KEY_ID        | ❌ Not set       | Phase 2 — not needed yet                                                                    |
| RAZORPAY_KEY_SECRET    | ❌ Not set       | Phase 2 — not needed yet                                                                    |
| CORS_ALLOWED_ORIGINS   | ✅ In Railway    | **Prod** includes Vercel web origin; **dev** still `http://localhost:5173` where configured |
| OTEL_EXPORTER_ENDPOINT | ❌ Not set       | http://localhost:4318/v1/traces for dev                                                     |

---

## 🏗️ Monorepo Structure (target)

```
gorola/
├── apps/
│   ├── api/                          # Fastify backend
│   │   ├── src/
│   │   │   ├── modules/
│   │   │   │   ├── auth/             # Buyer OTP + Store/Admin auth
│   │   │   │   ├── user/             # Buyer profile, addresses
│   │   │   │   ├── store/            # Store management
│   │   │   │   ├── store-owner/      # Store owner auth + dashboard
│   │   │   │   ├── admin/            # Admin panel
│   │   │   │   ├── catalog/          # Categories, Products, Variants
│   │   │   │   ├── cart/             # Cart management
│   │   │   │   ├── order/            # Order lifecycle
│   │   │   │   ├── promotion/        # Ads, Offers, Discounts
│   │   │   │   ├── feature-flag/     # Feature flags
│   │   │   │   ├── delivery/         # STUB — rider interface
│   │   │   │   └── audit/            # Audit logging
│   │   │   ├── lib/
│   │   │   │   ├── prisma.ts         # Prisma client singleton
│   │   │   │   ├── redis.ts          # Redis client singleton
│   │   │   │   ├── logger.ts         # Pino logger singleton
│   │   │   │   └── otel.ts           # OpenTelemetry initialization
│   │   │   ├── plugins/              # Fastify plugins
│   │   │   ├── server.ts             # Fastify instance factory
│   │   │   └── app.ts                # Entry point
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   ├── migrations/
│   │   │   └── seed.ts
│   │   └── __tests__/
│   │       ├── unit/
│   │       └── integration/
│   │
│   └── web/                          # React frontend
│       ├── src/
│       │   ├── pages/
│       │   │   ├── buyer/            # Home, Category, Product, Cart, Order
│       │   │   ├── store/            # Store panel pages
│       │   │   └── admin/            # Admin panel pages
│       │   ├── components/
│       │   │   ├── ui/               # shadcn/ui components (auto-generated)
│       │   │   ├── shared/           # Topographic bg, weather banner, etc.
│       │   │   ├── buyer/            # Buyer-specific components
│       │   │   ├── store/            # Store panel components
│       │   │   └── admin/            # Admin panel components
│       │   ├── hooks/                # Custom React hooks
│       │   ├── store/                # Zustand stores
│       │   ├── lib/
│       │   │   ├── api.ts            # Axios/fetch client with interceptors
│       │   │   ├── gsap.ts           # GSAP + ScrollTrigger setup
│       │   │   └── lenis.ts          # Lenis smooth scroll
│       │   └── styles/
│       │       ├── tokens.css        # GoRola CSS custom properties
│       │       ├── fonts.css         # Font imports + animation classes
│       │       └── globals.css       # Tailwind directives
│       └── tests/
│           └── e2e/                  # Playwright E2E tests
│
├── packages/
│   ├── shared/                       # Shared TypeScript types + Zod schemas
│   │   └── src/
│   │       ├── types/                # Domain types (Order, Product, etc.)
│   │       ├── schemas/              # Zod validation schemas
│   │       └── errors.ts             # AppError class hierarchy
│   └── ui/                           # Shared UI components (Phase 2+)
│
├── .github/
│   └── workflows/
│       └── ci-cd.yml            # CI + path filters + Vercel + Railway (main)
├── pnpm-workspace.yaml
├── package.json
├── tsconfig.base.json
├── eslint.config.ts
├── .prettierrc
└── .env.example
```

---

## 📊 Test Coverage Status

| Module            | Unit Tests | Integration Tests | Coverage                                                                                                                                                          |
| ----------------- | ---------- | ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| auth              | ✅         | ✅                | unit: `auth.service.test.ts`, `auth.middleware.test.ts`, `store-owner-auth.service.test.ts`, `admin-auth.service.test.ts`; integration: `auth.controller.test.ts` |
| user              | ❌         | ✅                | integration: `user.repository.test.ts`                                                                                                                            |
| store-owner       | ❌         | ✅                | integration: `store-owner.repository.test.ts`                                                                                                                     |
| admin             | ❌         | ✅                | integration: `admin.repository.test.ts`                                                                                                                           |
| **web (buyer)**   | **✅**     | ⏳                | **unit:** `apps/web` Vitest — stores, `api`, `query-client`, `form-wiring`, `router` (`HomePage`); E2E Playwright = Phase 2.18                                                                                          |
| catalog           | ❌         | ✅                | integration: `category`, `product`, `variant` `*.repository.test.ts`                                                                                              |
| cart              | ❌         | ✅                | integration: `cart.repository.test.ts`                                                                                                                            |
| order             | ✅         | ✅                | unit: `order.service.test.ts`; integration: `order.repository.test.ts`, `order.service.stock.integration.test.ts`                                                 |
| inventory (stock) | ❌         | ✅                | integration: `stock-movement.repository.test.ts`                                                                                                                  |
| address           | ❌         | ✅                | integration: `address.repository.test.ts`                                                                                                                         |
| store             | ❌         | ✅                | integration: `store.repository.test.ts`                                                                                                                           |
| promotion         | ❌         | ✅                | integration: `advertisement`, `offer`, `discount` `*.repository.test.ts`                                                                                          |
| feature-flag      | ❌         | ✅                | integration: `feature-flag.repository.test.ts`                                                                                                                    |
| audit             | ❌         | ✅                | integration: `audit.repository.test.ts`                                                                                                                           |
| delivery (stub)   | ❌         | ✅                | integration: `rider.repository.test.ts`                                                                                                                           |

---

## 🔗 Important URLs

| Resource     | URL                                                                             | Status |
| ------------ | ------------------------------------------------------------------------------- | ------ |
| GitHub Repo  | `https://github.com/kashishjd0009-creator/gorola_app`                           | ✅     |
| Railway API  | `https://gorolaapp-production.up.railway.app`                                   | ✅     |
| Vercel Web   | _Production URL on Vercel project (Domains)_ — e.g. `https://<name>.vercel.app` | ✅     |
| Health Check | `https://gorolaapp-production.up.railway.app/api/health`                        | ✅     |

---

## 💡 Session Notes & Decisions Made

_(Append new entries — never delete old ones)_

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
