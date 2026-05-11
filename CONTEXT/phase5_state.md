# GoRola — Phase 5 State (Rider Interface)

> **This file covers Phase 5: the Rider Interface.**
> Phase 5 can start independently of Phase 3 and 4 — it only requires Phase 2 backend infrastructure.
> The 4 HTTP stubs (W-015) and the `/rider` Socket.IO namespace stub are already registered.
> For overall project status: read `current_state.md` first.

---

## Phase Status

| Phase   | Name              | Status      | Notes |
| ------- | ----------------- | ----------- | ----- |
| Phase 5 | Rider Interface   | NOT STARTED | Stubs registered (W-015). Start any time after Phase 2. |

---

## 📍 Last Updated

- **Date:** NOT STARTED
- **Session Summary:** Not started yet. Full 6-section TDD plan drafted (5.1–5.6).
- **Next Session Must Start With:** Phase 5.1 — Rider Auth. Replace the 501 stub in `delivery/rider.controller.ts` with real `RiderAuthService.login`. Seed a `DeliveryRider` row in the test DB.
- **In Progress Right Now:** Nothing — Phase 5 has not started. Begin at Phase 5.1.
- **Current Blocker:** None. Can start independently of Phase 3 & 4.

> ⚠️ **Update THIS block at the end of every session** (not `current_state.md`). Also mark completed checklist items `[x]` and append to the Session Notes section at the bottom. Update `current_state.md` ONLY when Phase 5 changes status (NOT STARTED → IN PROGRESS → COMPLETE).


## Architecture

- Rider frontend lives in **`apps/web/src/pages/rider/`** — same single Vite SPA, same Vercel deployment.
- Access gated by **`RiderRoute`** component (requires `RIDER` role in JWT) — matching store/admin pattern.
- Backend controllers in **`apps/api/src/modules/delivery/`** (replace the 501 stub implementations).
- Real-time location tracking via **Socket.IO `/rider` namespace** (currently stubs disconnecting).
- Rider accounts are created by the Admin panel (Phase 4 can add rider creation, or seed via script in Phase 5).

---

## Mandatory API Contract Gate (all Phase 5 items)

- [ ] Required backend endpoint(s) fully implemented (not 501)
- [ ] Backend integration tests verify: endpoint contract, HTTP status codes, auth/role guards, real-time behavior
- [ ] Endpoint routes registered and returning correct responses (not `NOT_IMPLEMENTED`)
- [ ] Frontend/client tests verify: expected API/socket envelope, loading state, empty state, error state

---

## Phase 5 Checklist

---

### 5.1 — Rider Auth

**Root Cause / Goal:**
`POST /api/v1/rider/auth/login` currently returns 501. Rider accounts need to be created (by admin or seed) and riders need to authenticate with email + password (no OTP, no 2FA required — riders need fast login on mobile). Authentication returns a JWT with `role: 'RIDER'` and a `storeId` scoping the rider to one store.

**Fix / Approach:**
1. [Schema] Add `DeliveryRider` model fields if not complete: `id`, `email`, `passwordHash`, `storeId` (FK), `isActive`, `createdAt`. Run migration.
2. [Backend] Replace the 501 stub with real implementation: `RiderAuthService.login(email, password)` → validates credentials → returns `{ accessToken, refreshToken }`.
3. [Frontend] Create `RiderLoginPage.tsx` → `/rider/login`. Create `RiderRoute` guard.

---

- [ ] **RED — Integration (`rider.auth.test.ts`):**
  - [ ] Test setup: seed 1 `DeliveryRider` row with email `rider@test.com`, hashed password, `storeId`
  - [ ] Test: `POST /api/v1/rider/auth/login` with `{ email: 'rider@test.com', password: 'correct' }` → HTTP 200 (not 501) with `{ success: true, data: { accessToken, refreshToken } }`; JWT payload contains `{ role: 'RIDER', riderId, storeId }`
  - [ ] Test: `POST /api/v1/rider/auth/login` with wrong password → HTTP 401 `AUTH_FAILED`
  - [ ] Test: `POST /api/v1/rider/auth/login` for inactive rider (`isActive: false`) → HTTP 403 `ACCOUNT_SUSPENDED`
  - [ ] **Run — confirm RED (currently returns 501)**

- [ ] **GREEN — Backend:**
  - [ ] [Schema] Verify `DeliveryRider` model in `schema.prisma` has all required fields; run migration if needed
  - [ ] [Service] Create `RiderAuthService.login(email, password)` in `delivery/rider-auth.service.ts`: find rider by email, compare password hash (`bcryptjs`), check `isActive`, issue JWT with `role: 'RIDER'`
  - [ ] [Controller] Replace stub in `delivery/rider.controller.ts`: `POST /api/v1/rider/auth/login` calls `RiderAuthService.login`
  - [ ] [Routes] Update `registerRiderRoutes` in `routes.ts` — remove the 501 stub handler, wire real controller
  - [ ] Run integration tests — **confirm GREEN**

- [ ] **RED — Unit/Component (`RiderLoginPage.test.tsx`):**
  - [ ] Test: renders email + password inputs with `id="rider-email"` and `id="rider-password"`
  - [ ] Test: on success, `setRiderSession` called with `{ accessToken, refreshToken, riderId, storeId }` and `navigate` goes to `/rider/orders`
  - [ ] Test: on 401, shows "Invalid credentials" error

- [ ] **RED — Unit/Component (`RiderRoute.test.tsx`):**
  - [ ] Test: no RIDER role → `<Navigate to="/rider/login" />`
  - [ ] Test: RIDER role → children rendered

- [ ] **GREEN — Frontend:**
  - [ ] Create `apps/web/src/pages/rider/RiderLoginPage.tsx`
  - [ ] Create `apps/web/src/components/rider/RiderRoute.tsx`
  - [ ] Add `/rider/login` and `/rider/*` routes in `App.tsx`
  - [ ] Run unit tests — **confirm GREEN**

- [ ] **Verification chain:**
  - [ ] Seeded rider navigates to `/rider/login` → enters credentials → JWT issued with RIDER role → redirected to `/rider/orders` → ✅

---

### 5.2 — Active Orders Feed

**Root Cause / Goal:**
`GET /api/v1/rider/orders/active` currently returns 501. Riders need to see all orders assigned to their store that are in state `OUT_FOR_DELIVERY` (assigned to this rider) or `PREPARING` (ready for pickup from store).

**Fix / Approach:**
Replace the 501 stub. Return orders filtered by `storeId` from JWT and status in `['PREPARING', 'OUT_FOR_DELIVERY']`.

---

- [ ] **RED — Integration (`rider.orders.test.ts`):**
  - [ ] Test setup: store with 3 orders: 1 PLACED, 1 PREPARING, 1 OUT_FOR_DELIVERY
  - [ ] Test: `GET /api/v1/rider/orders/active` with RIDER JWT (`storeId` = that store) → HTTP 200 (not 501); returns 2 orders (PREPARING + OUT_FOR_DELIVERY); PLACED order absent
  - [ ] Test: response each order has `{ id, status, items: [{ productName, variantLabel, quantity }], deliveryAddress: { landmark }, buyerMaskedPhone, createdAt }`
  - [ ] Test: `GET /api/v1/rider/orders/active` with BUYER JWT → HTTP 403
  - [ ] Test: `GET /api/v1/rider/orders/active` with RIDER JWT from a different store → returns 0 orders (strict store scope)
  - [ ] **Run — confirm RED (501)**

- [ ] **GREEN — Backend:**
  - [ ] [Service] Create `RiderOrderService.getActiveOrders(storeId)` in `delivery/rider-order.service.ts`: calls `OrderRepository.findManyByStore(storeId, { status: ['PREPARING', 'OUT_FOR_DELIVERY'] })`
  - [ ] [Controller] Replace stub: `GET /api/v1/rider/orders/active` with `requireAuth` + `requireRole('RIDER')`; extracts `storeId` from JWT; calls service
  - [ ] Run integration tests — **confirm GREEN**

- [ ] **RED — Unit/Component (`RiderOrdersPage.test.tsx`):**
  - [ ] Test: renders list of active orders grouped by status (PREPARING section, OUT_FOR_DELIVERY section)
  - [ ] Test: each order card shows buyer masked phone, delivery landmark, items list, time elapsed since PLACED
  - [ ] Test: empty state shows "No active orders right now" when list is empty
  - [ ] Test: page auto-refreshes every 30 seconds (`refetchInterval: 30000`)
  - [ ] **Run — confirm RED**

- [ ] **GREEN — Frontend:**
  - [ ] Create `apps/web/src/pages/rider/RiderOrdersPage.tsx`; run unit tests — **confirm GREEN**

- [ ] **Verification chain:**
  - [ ] Rider logs in → `/rider/orders` shows PREPARING orders ready for pickup → ✅

---

### 5.3 — Order Status Update

**Root Cause / Goal:**
`PUT /api/v1/rider/orders/:id/status` currently returns 501. Riders need to update order status with restricted transitions: PREPARING→OUT_FOR_DELIVERY, OUT_FOR_DELIVERY→DELIVERED. Riders cannot cancel orders.

---

- [ ] **RED — Integration (`rider.status.test.ts`):**
  - [ ] Test: `PUT /api/v1/rider/orders/<orderId>/status` with body `{ status: 'OUT_FOR_DELIVERY' }` (order currently PREPARING) → HTTP 200; DB status = OUT_FOR_DELIVERY; `OrderStatusHistory` has new entry; buyer's Socket.IO `order:{orderId}` room receives `order_status_changed` event
  - [ ] Test: `PUT .../status` with body `{ status: 'DELIVERED' }` (currently OUT_FOR_DELIVERY) → HTTP 200; DB status = DELIVERED
  - [ ] Test: `PUT .../status` with body `{ status: 'PLACED' }` → HTTP 422 `INVALID_STATUS_TRANSITION` (backward transition forbidden)
  - [ ] Test: `PUT .../status` with body `{ status: 'CANCELLED' }` → HTTP 403 `FORBIDDEN` (riders cannot cancel)
  - [ ] Test: updating an order from a different store → HTTP 403 `FORBIDDEN`
  - [ ] **Run — confirm RED (501)**

- [ ] **GREEN — Backend:**
  - [ ] [Service] Add `updateOrderStatus(storeId, orderId, newStatus)` to `rider-order.service.ts`: validates order belongs to `storeId`; validates transition (only PREPARING→OUT_FOR_DELIVERY or OUT_FOR_DELIVERY→DELIVERED allowed); calls `OrderRepository.updateStatus`; emits `order_status_changed` to `order:{orderId}` Socket.IO room
  - [ ] [Controller] Replace stub: `PUT /api/v1/rider/orders/:id/status` with `requireAuth` + `requireRole('RIDER')`
  - [ ] Run integration tests — **confirm GREEN**

- [ ] **RED — Unit/Component (`RiderOrdersPage.test.tsx` — additional tests):**
  - [ ] Test: PREPARING order card shows "Mark as Out for Delivery" button; clicking opens confirmation modal
  - [ ] Test: OUT_FOR_DELIVERY card shows "Mark as Delivered" button
  - [ ] Test: after status update, card moves to correct section or disappears from active list
  - [ ] **Run — confirm RED**

- [ ] **GREEN — Frontend:** Update `RiderOrdersPage.tsx` with status action buttons; run unit tests — **confirm GREEN**

- [ ] **Verification chain:**
  - [ ] Rider clicks "Mark as Out for Delivery" → confirm → order moves to delivery section → buyer `/orders/:id` page updates status in real-time via Socket.IO → ✅

---

### 5.4 — Real-Time Location Tracking

**Root Cause / Goal:**
`PUT /api/v1/rider/location` currently returns 501. The `/rider` Socket.IO namespace stubs disconnect on connect. Riders need to push GPS coordinates periodically; buyers tracking their order see the rider's location update in real-time.

**Fix / Approach:**
Replace HTTP stub with real implementation. Activate the `/rider` Socket.IO namespace to accept connections, authenticate via JWT, and broadcast location to the buyer's `order:{orderId}` room.

---

- [ ] **RED — Integration (`rider.location.test.ts`):**
  - [ ] Test: `PUT /api/v1/rider/location` with body `{ lat: 30.4593, lng: 78.0677, orderId: '<id>' }` with RIDER JWT → HTTP 200 (not 501); `RiderLocation` row upserted in DB with `{ riderId, lat, lng, updatedAt }`
  - [ ] Test: `PUT /api/v1/rider/location` with invalid lat (> 90) → HTTP 400 `VALIDATION_ERROR`
  - [ ] Test: Socket.IO `/rider` namespace: connect with valid RIDER JWT → connection accepted (no immediate disconnect)
  - [ ] Test: after `PUT /api/v1/rider/location`, Socket.IO room `order:<orderId>` receives event `rider_location_update` with payload `{ lat, lng, updatedAt }`
  - [ ] **Run — confirm RED (501 + Socket.IO disconnect)**

- [ ] **GREEN — Backend:**
  - [ ] [Schema] Verify `RiderLocation` model: `{ riderId (unique FK), lat Decimal, lng Decimal, updatedAt }`; run migration if needed
  - [ ] [Service] Create `RiderLocationService.updateLocation(riderId, { lat, lng, orderId })`: upserts `RiderLocation`; emits `rider_location_update` to `order:{orderId}` Socket.IO room via `io.to(room).emit(...)`
  - [ ] [Controller] Replace 501 stub: `PUT /api/v1/rider/location` with `requireAuth` + `requireRole('RIDER')`
  - [ ] [Socket.IO] Update `/rider` namespace in `socket.ts`: authenticate connection via JWT cookie/header; on `rider_location` event from client, call `RiderLocationService.updateLocation`; on disconnect, log rider offline
  - [ ] Run integration tests — **confirm GREEN**

- [ ] **RED — Unit/Component (new `useRiderLocation.test.ts` hook):**
  - [ ] Test: hook calls `navigator.geolocation.watchPosition` on mount and stops watching on unmount
  - [ ] Test: on each position update, calls `PUT /api/v1/rider/location` with `{ lat, lng, orderId }`
  - [ ] Test: if geolocation is denied, hook sets `error: 'LOCATION_DENIED'` state
  - [ ] **Run — confirm RED**

- [ ] **GREEN — Frontend:**
  - [ ] Create `apps/web/src/hooks/useRiderLocation.ts`: wraps `navigator.geolocation.watchPosition`, calls PUT on each update, cleans up on unmount
  - [ ] Use hook in `RiderOrdersPage.tsx` — active only when rider has an OUT_FOR_DELIVERY order
  - [ ] Run unit tests — **confirm GREEN**

- [ ] **Verification chain:**
  - [ ] Rider marks order OUT_FOR_DELIVERY → browser requests location permission → rider moves → buyer `/orders/:id` page receives `rider_location_update` → map/placeholder updates → ✅

---

### 5.5 — Rider Frontend (Mobile-First UI)

**Root Cause / Goal:**
Rider interface needs to be mobile-first (riders use smartphones). The layout must be simple, large-tap-target, and work well on iPhone SE (375px). No complex tables or sidebars — a bottom navigation tab bar instead.

---

- [ ] **RED — Unit/Component (`RiderLayout.test.tsx`):**
  - [ ] Test: renders bottom tab bar with "Orders" and "Account" tabs
  - [ ] Test: "Orders" tab is active on `/rider/orders`; "Account" tab active on `/rider/account`
  - [ ] Test: on mobile viewport (375px), all tap targets are >= 44px height
  - [ ] **Run — confirm RED**

- [ ] **GREEN — Frontend:**
  - [ ] Create `apps/web/src/components/rider/RiderLayout.tsx`: bottom tab bar (Orders | Account); no sidebar
  - [ ] Create `apps/web/src/pages/rider/RiderAccountPage.tsx` → `/rider/account`: shows rider name, store name, logout button
  - [ ] All rider pages use `min-h-screen` mobile layout, large font sizes (`text-xl`+), large buttons (`py-4`)
  - [ ] Run unit tests — **confirm GREEN**

- [ ] **Verification chain:**
  - [ ] Open rider app on 375px viewport → bottom tab bar visible → all buttons easily tappable → ✅

---

### 5.6 — Rider E2E Tests (Playwright)

- [ ] `tests/e2e/rider-journey.spec.ts`:
  - [ ] Rider login with seeded credentials → JWT with RIDER role → redirect to `/rider/orders`
  - [ ] Active orders page shows PREPARING orders for rider's store
  - [ ] Click "Mark as Out for Delivery" on order → confirm → order status updates in DB → buyer order page reflects DELIVERING status
  - [ ] Click "Mark as Delivered" → DB status = DELIVERED → buyer sees delivered state
  - [ ] Location update: mock `navigator.geolocation` → PUT location called with valid lat/lng → 200 response
  - [ ] Unauth access to `/rider/orders` redirects to `/rider/login`

---

## Session Notes (Phase 5)

_(Append new entries here — never delete old entries.)_
