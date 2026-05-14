# Rationale: Why Build Before Testing?

In a complex monorepo architecture, the sequence of operations in a CI pipeline is critical for both speed and correctness. This guide explains why we place the **Build** step before **Unit, Integration, and E2E tests**.

---

## 1. Dependency Generation (e.g., Prisma Client)
Many modern tools use code generation to provide type-safety. In our case, the API uses **Prisma**.
*   **The Issue**: Integration tests import the Prisma client (`@prisma/client`) to perform database operations. This client is a generated artifact that lives in `node_modules`.
*   **The Fix**: Running the build script for the API package executes `prisma generate`. By building before testing, we ensure that every test is running against the most up-to-date version of the database schema. Without this, tests might fail with cryptic "Schema mismatch" or "Client not found" errors.

---

## 2. Shared Package Integrity
In a monorepo, multiple applications (`apps/web`, `apps/api`) often depend on a core package (`packages/shared`).
*   **The Issue**: Changes in the shared package might be picked up by the IDE, but the **compiled output** (which the apps actually import during execution) might be stale.
*   **The Fix**: A full monorepo build compiles all internal packages and links them correctly. This prevents "Ghost Bugs"—where a test fails because it's looking at an old version of a shared library's logic.

---

## 3. The "Fail Fast" Philosophy
CI pipelines are designed to save developer time by providing quick feedback.
*   **The Issue**: If a developer commits a syntax error or a broken import that prevents the final production build from succeeding, we want to know that as soon as possible.
*   **The Fix**: By placing the Build step upfront, the pipeline fails immediately if the code is "un-shippable." This avoids wasting 5-10 minutes of CI time running unit tests on code that can't even be deployed.

---

## 4. Deterministic E2E Environments
E2E tests (like Playwright) are notoriously flaky when run against "live-compiling" dev servers (like Vite in dev mode).
*   **The Issue**: Dev servers perform heavy CPU-bound work (pre-bundling) when the first test navigates to a page. In a resource-constrained CI environment, this leads to timeouts.
*   **The Fix**: Running tests against **Production Artifacts** (the `dist/` folder) is deterministic. The server merely serves static files, leaving 100% of the CPU free for the browser and the test runner.

---

## Summary: The Logical Workflow
By structuring the pipeline this way, we create a logical sequence of verification:

1.  **Check Quality** (Lint/Typecheck): Is the code written correctly?
2.  **Create the Product** (Build): Can the code be turned into a real application?
3.  **Verify the Product** (Test): Does the final application actually work?

This sequence ensures that by the time you reach the most "expensive" tests (E2E), you have already proven that the code is syntactically correct, type-safe, and buildable.
