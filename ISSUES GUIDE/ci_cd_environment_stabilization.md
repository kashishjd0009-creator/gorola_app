# CI/CD Environment Stabilization (Mocking vs. Spying)

## 1. The Problem
After introducing new features like **Order Ratings** and **Advertisements**, the project's CI/CD pipeline (GitHub Actions) began failing, even though all tests passed perfectly on the developer's local machine.

There were two distinct types of failures:
1.  **Frontend**: `TypeError: Cannot convert undefined or null to object`
2.  **Backend**: `Foreign key constraint violated: Advertisement_storeId_fkey`

---

## 2. The Root Causes

### A. The "Ghost" Environment Variables (Frontend)
In the GoRola codebase, the `api` instance (Axios) is designed to be `null` if the `VITE_API_BASE_URL` is missing. 
*   **Locally**: Your `.env` file provides this URL, so the `api` object is created.
*   **In CI**: GitHub Actions doesn't have your `.env` file. The `api` object became `null`.
*   **Mock vs. Spy**:
    *   Tests using `vi.mock` passed because they replaced the entire file with a "toy" version before it even tried to check for the URL.
    *   Tests using `vi.spyOn` failed because they tried to "watch" the real `api` object, which was `null` in CI. You can't put a tracker on a phone that doesn't exist!

### B. The Cleanup Chain-Reaction (Backend)
To keep tests fast and isolated, we wipe the database before every test.
*   **The Conflict**: We recently added the `Advertisement` model, which points to a `Store`.
*   **The Failure**: The cleanup code in some older tests was trying to delete the **Store** first. The database blocked this because the **Advertisement** still existed, and it didn't want to leave an advertisement pointing to a non-existent store.

---

## 3. The Resolution

### Fix 1: Test-Safe API Initialization
We updated `apps/web/src/lib/api.ts` to ensure that if the app detects it is running in "Test Mode" (`import.meta.env.MODE === 'test'`), it will always create a dummy API instance even if the URL is missing. This makes both Spies and Mocks work instantly in any environment.

### Fix 2: Hierarchical Database Cleanup
We updated the `cleanGraph` functions in the backend integration tests to follow the correct "deletion order":
1.  Delete **Advertisements**, **Offers**, and **Discounts** first.
2.  Delete **Stores** and **Categories** second.
3.  Delete **Users** and **Addresses** last.
This respects the database's rules (Foreign Key Constraints) and prevents cleanup crashes.

---

## 4. Key Learnings
1.  **Don't rely on local `.env` for tests**: Always provide fallbacks for critical objects in test mode.
2.  **Mocks > Spies for CI**: Mocking the entire module (`vi.mock`) is safer in CI because it skips the execution of the real file entirely.
3.  **Update Cleanups**: Every time a new database model is added, check the integration test cleanup functions to see if they need to be updated.

---

## 5. Case Study: The "Leaky" Websocket Test

### The Symptom
Unit tests were passing, but the terminal was filled with "noisy" error messages:
`Socket connection error: TransportError: websocket error` and `code: 'ECONNREFUSED'`.

### The Cause
This was a variation of the **Mock vs. Spy** problem. Because `socket.io-client` was not mocked, Vitest loaded the **Real** library. The real library executed its real logic—trying to connect to a backend server at `localhost:3001`—which didn't exist in the unit test environment.

### The Resolution
We implemented a **Global Mock** in `apps/web/src/test/setup.ts`. 

```typescript
vi.mock("socket.io-client", () => ({
  io: () => ({
    on: vi.fn(),
    off: vi.fn(),
    emit: vi.fn(),
    disconnect: vi.fn(),
    connect: vi.fn(),
  }),
}));
```

### Key Takeaway
**Unit tests must be 100% isolated.** If you see a network-related error (Connection Refused, Timeout) in a unit test, it means a real library is "leaking" into your test. Always intercept network-dependent libraries at the global setup level to keep tests clean and fast.
