# CI/CD E2E Stabilization: The "Build vs. Dev" Strategy

In a monorepo environment, ensuring that End-to-End (E2E) tests run reliably in a CI pipeline (like GitHub Actions) requires a different approach than local development. This guide explains the technical reasons behind the **"Build-First"** strategy and why **"Dev Mode"** is a common cause of CI flakiness.

---

## 1. Why `pnpm dev` is the Enemy of CI

Local development servers (like Vite's `dev` or `tsx watch`) are optimized for **human developers**, not **automated runners**.

### A. The "On-the-Fly" Compilation Penalty
In `dev` mode, the server doesn't compile everything at once. It performs **lazy-loading** and **pre-bundling** on demand.
*   **Locally**: Your machine has 8+ cores and plenty of RAM. You don't notice the 1-2 second delay when you click a new page.
*   **In CI**: GitHub Actions runners are typically 2-core machines. When Playwright requests a page, Vite may spin up a massive compilation process that consumes 100% of the CPU. This causes the request to hang, leading to the dreaded **E2E Timeout**.

### B. The Startup Race Condition
Playwright's `webServer` check waits for a URL to return a success code. 
*   A dev server might open its port and return a `200` status *before* it has actually finished preparing the Javascript bundle. 
*   Playwright then starts the tests, tries to interact with the page, but the page is still "blank" or "loading" because the server is internally struggling to compile.

---

## 2. The Solution: The "Build-First" Pipeline

Instead of running the raw source code, we switch the entire pipeline to use **Production Artifacts**.

### Step 1: Pre-Build Everything
In the CI workflow (`ci.yml`), we run `pnpm build` **before** any tests.

```yaml
- name: Build Monorepo
  run: pnpm build
```

**Why build first?**
1.  **Fail Fast**: If the project doesn't build, it doesn't matter if the tests pass. We catch "unbuildable" code immediately.
2.  **Artifact Generation**: Building ensures that `Prisma Client`, `Shared Libraries`, and `Frontend Bundles` are physically written to disk.
3.  **Zero Overhead**: Once built, the code is "static." Running it requires almost zero CPU compared to a dev server.

### Step 2: Use Production-Ready Servers
Update `playwright.config.ts` to point at the built files:

| App Type | Local Command | CI Command | Why? |
| :--- | :--- | :--- | :--- |
| **Frontend** | `pnpm dev` | `pnpm preview` | `preview` serves the static `dist/` folder. No compilation happens. |
| **Backend** | `pnpm dev` | `node dist/app.js` | Runs the raw compiled Javascript. No `tsx` or `watch` overhead. |

---

## 3. Dealing with Resource Contention

A typical E2E run in CI involves:
1.  A Database (Postgres)
2.  A Cache (Redis)
3.  An API Server
4.  A Web Server
5.  A Browser (Chromium)

On a **2-core CI runner**, these 5 processes are fighting for the same CPU cycles.

### Strategy: Sequential Power
By building the code first, we remove the CPU-heavy "Compilation" task from the equation. When the E2E tests start, the CPU is free to focus 100% on **Running the Browser** and **Processing API requests**.

---

## 4. Checklist for E2E Stability

- [ ] **No `watch` mode**: Ensure no process in CI is watching for file changes.
- [ ] **Wait for Health**: Always use a health-check URL (e.g., `/api/health`) for `webServer` checks.
- [ ] **Timeout Buffers**: Set a longer `timeout` (e.g., 120s) in `playwright.config.ts` to account for the slower CI environment.
- [ ] **Isolated Workers**: Use `workers: 1` in CI if your tests share a single database to avoid race conditions.

## Summary
The secret to stable CI E2E tests is **Isolation and Pre-computation**. By building your application into static artifacts before the first test runs, you eliminate the unpredictable performance of development tools and ensure that your tests are validating your **real production code**.
