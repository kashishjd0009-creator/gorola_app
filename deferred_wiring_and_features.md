# Deferred Wiring & Feature Backlog

> **Purpose:** This document tracks items identified during the post-Phase 2.18 audit that were intentionally excluded from the Phase 2.19 Wiring Hardening session. These items were omitted because they represent entirely new feature sets, require UX design decisions, depend on infrastructure setup, or strictly belong to later phases (like Store Owner or Admin panels).

This guide provides step-by-step TDD implementation plans for when these items are ready to be tackled, along with clear prerequisites or decisions needed from the user.

---

## 1. Observability: Prometheus Metrics (`prom-client`)

**Root Cause:** `rules_and_spec.md §9` mandates specific metrics: `http_requests_total`, `http_request_duration_seconds`, `active_orders_total`, `otp_sends_total` exposed at `/api/metrics`. Currently, the API has Pino logs and OpenTelemetry traces, but no metrics registry or `prom-client` installation.

**Prerequisites / User Action Needed:**
- No code prerequisites. This is ready to implement at any time.

**Implementation Plan (TDD):**
- [ ] **RED — Integration (`server.metrics.test.ts`):**
  - [ ] Test: `GET /api/metrics` returns HTTP 200 with `Content-Type: text/plain` containing Prometheus formatted metrics.
  - [ ] Test: Making a generic API request increments `http_requests_total`.
  - [ ] Run — confirm RED (404 currently).
- [ ] **GREEN — Backend (`telemetry.ts` & `server.ts`):**
  - [ ] `pnpm --filter @gorola/api add prom-client`
  - [ ] In `telemetry.ts` (or new `metrics.ts`), initialize a `prom-client` `Registry`.
  - [ ] Create counters/histograms for the 4 required metrics.
  - [ ] Create a Fastify hook (`onRequest` and `onResponse`) to track request counts and durations.
  - [ ] Register `GET /api/metrics` route (internal only, or basic auth protected if public).
  - [ ] Run tests — GREEN.

---

## 2. Infrastructure: OpenTelemetry Exporter

**Root Cause:** The application initializes OpenTelemetry traces, but `OTEL_EXPORTER_ENDPOINT` is not set. In local development, traces dump to the console. No trace data is actually being collected by a telemetry backend.

**Prerequisites / User Action Needed:**
- **Infrastructure Setup:** You need to decide where traces should go. 
  - *Local Dev:* Do you want a `docker-compose.yml` to spin up a local Jaeger or Grafana Tempo instance?
  - *Production:* Do you have a Datadog, Honeycomb, or managed Grafana endpoint?
- You must provide the endpoint URL and any necessary authentication headers.

**Implementation Plan:**
- [ ] Set `OTEL_EXPORTER_ENDPOINT=http://localhost:4318/v1/traces` in `.env`.
- [ ] Spin up the telemetry backend (e.g., Jaeger via Docker).
- [ ] Verify: Place an order via the UI and confirm the full distributed trace appears in the Jaeger UI.

---

## 3. UX Design: BuyerNav Hardcoded Location

**Root Cause:** `BuyerNav.tsx` displays `<span>Kulri, Mussoorie</span>` as static text. It has no click handler and is not wired to the user's saved addresses or browser geolocation.

**Prerequisites / User Action Needed:**
- **Design Decision Required:** What should happen when a user clicks the location in the navbar?
  - *Option A:* Open a modal allowing them to select from their `Saved Addresses` or use "Current Location" (GPS).
  - *Option B:* Redirect them to the `/profile/addresses` page to manage their locations.
  - *Option C:* Open the existing `AddressMapPicker` in a slide-out drawer.
- Let me know which UX flow you prefer before starting this.

**Implementation Plan (Assuming Option A: Modal Selector):**
- [ ] **RED — Unit (`BuyerNav.test.tsx`):**
  - [ ] Test: Location text reads from `useLocationStore` (or auth store default address).
  - [ ] Test: Clicking the location text opens the `LocationSelectorModal`.
  - [ ] Run — confirm RED.
- [ ] **GREEN — Frontend (`BuyerNav.tsx` & `LocationSelectorModal.tsx`):**
  - [ ] Create Zustand store or context to hold the "active delivery location".
  - [ ] Update `BuyerNav` to reflect this state instead of hardcoded text.
  - [ ] Build `LocationSelectorModal` fetching `GET /api/v1/addresses`.
  - [ ] Run tests — GREEN.

---

## 4. Phase 3 & 4: Store Owner & Admin Auth Runtime

**Root Cause:** `routes.ts` registers `storeOwnerAuthService` and `adminAuthService` as mock objects that explicitly throw `NotImplementedError("Admin auth deferred to Phase 4")`. The documentation says auth is done, but the runtime blocks it.

**Prerequisites / User Action Needed:**
- This strictly belongs to the start of Phase 3 (Store Panel) and Phase 4 (Admin Panel). Do not implement this until you are ready to build the respective dashboards, as there is nowhere to redirect them after login.

**Implementation Plan (TDD - Store Owner Example):**
- [ ] **RED — Integration (`store-owner-auth.controller.test.ts`):**
  - [ ] Test: `POST /api/v1/auth/store-owner/login` returns valid JWT/Refresh tokens for correct credentials.
  - [ ] Run — confirm RED (Throws 501 NotImplemented).
- [ ] **GREEN — Backend (`store-owner-auth.service.ts`):**
  - [ ] Implement bcrypt password verification against `StoreOwner` table.
  - [ ] Implement TOTP verification via `otplib`.
  - [ ] Wire the real service into `routes.ts` instead of the stub.
  - [ ] Run tests — GREEN.

---

## 5. Phase 3.3: `new_order` Socket.IO Event for Store Room

**Root Cause:** When a buyer places an order, the buyer joins `order:{orderId}`. However, `rules_and_spec.md` states that the store owner should receive a `new_order` event in the `store:{storeId}` room. This emission is completely missing from the `placeFromCart` flow.

**Prerequisites / User Action Needed:**
- This belongs to Phase 3.3 (Store Incoming Orders). There is no point emitting this event right now because no frontend client (Store Panel) exists to listen to it.

**Implementation Plan (TDD):**
- [ ] **RED — Integration (`order.socket.test.ts`):**
  - [ ] Test: Connect a mock socket to `store:{storeId}` room. Trigger `placeFromCart`. Assert the socket receives the `new_order` event with the correct payload.
  - [ ] Run — confirm RED.
- [ ] **GREEN — Backend (`order.service.ts` & `socket.ts`):**
  - [ ] Inject the Socket.IO server instance (`io`) or an `EventBus` into `OrderService`.
  - [ ] At the end of a successful `placeFromCart` transaction, emit `io.to(store:${storeId}).emit('new_order', { orderId, ... })`.
  - [ ] Run tests — GREEN.
