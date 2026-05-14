# The Principle of Parallel Environment Isolation

This guide establishes the architecture for running End-to-End (E2E) tests in parallel with active local development without port collisions or environment contamination.

---

## 1. The Problem: The "Port in Use" Conflict

Most web applications bind to "well-known" default ports:
- **Frontend (Vite/React)**: `5173` or `3000`
- **Backend (Node/Go/Python)**: `3001` or `8000`

**In the GoRola environment**, we use a custom standard:
- **Frontend**: `5180`
- **Backend**: `3001`

When a developer is actively working on a feature, their dev server is already holding these ports. If they (or a CI runner on the same machine) attempt to start an E2E suite that tries to bind to the same API port (`3001`), the suite will crash with `EADDRINUSE`.

## 2. The Solution: Shifted Test-Specific Ports

To achieve 100% isolation, the test environment should be assigned a "Reserved Range" of ports that do not overlap with development defaults.

**Universal Pattern:**
- **Development (Frontend)**: `5180` (Standard for GoRola)
- **Development (Backend)**: `3001`
- **Testing (Backend)**: `3002` (Isolated for E2E)

By shifting the API port specifically, you create a "Shadow Backend" where the E2E suite can run against a test database while the developer continues to use the development database on the default port.

### GoRola Case Study:
In our `playwright.config.ts`, we explicitly shift the API port to 3002 while retaining 5180 for the frontend:
```typescript
webServer: [
  {
    // Frontend stays on 5180 (standard)
    command: 'pnpm dev --port 5180',
    url: 'http://127.0.0.1:5180',
    env: { VITE_API_BASE_URL: 'http://127.0.0.1:3002' }
  },
  {
    // Backend shifted to 3002 to avoid 3001 conflict
    command: 'PORT=3002 pnpm dev',
    url: 'http://127.0.0.1:3002/api/health',
    env: { PORT: '3002' }
  }
]
```

---

## 3. Principle of Explicit Routing

Never rely on `localhost` or environmental "guesses" in E2E tests.

### A. The 127.0.0.1 Standard
As documented in the *Deterministic Networking* guide, always use the IPv4 loopback `127.0.0.1`. This avoids the dual-stack resolution lag (IPv4 vs IPv6) which can cause subtle "Connection Refused" errors in CI environments.

### B. Hard-Linked URLs
In your test configuration, explicitly link the frontend to the backend's test port via environment variables (e.g., `VITE_API_BASE_URL`). Do not assume the frontend will find the backend on the "default" dev port.

---

## 4. Environment Safety (The "Test Mode" Flag)

To prevent tests from accidentally writing to a developer's local database or a production cache, use a strict `NODE_ENV=test` or `APP_ENV=test` flag.

**Best Practices:**
1. **Dynamic Config**: If `APP_ENV === 'test'`, use `DATABASE_URL_TEST`.
2. **Fail-Fast**: If the test-specific database string is missing, the application should crash immediately rather than falling back to the development database.

---

## 5. Summary for Future Projects
1. **Assign** a unique, non-colliding port range for your E2E suite (e.g., `+10` or `+100` from defaults).
2. **Inject** these ports into your application via environment variables during the test boot sequence.
3. **Bind** explicitly to `127.0.0.1` to ensure cross-platform consistency.
4. **Enforce** environment isolation to protect development and production data.
