# Security Linting & Dependency Audits

This guide explains how GoRola handles automated security scanning in the CI pipeline (`ci:quality`), how to interpret false-positive warnings, and how to safely resolve security failures without causing "warning fatigue."

## 1. Dependency Vulnerability Audits (`pnpm audit`)

We use `pnpm audit --audit-level=high` in our `ci:quality` script. This strictly fails the build if any of our third-party dependencies have a High or Critical vulnerability.

### Handling False Positives or Unpatchable Deep Dependencies
Sometimes, a deep sub-dependency (like a package used internally by `shadcn` or Vite) will have a vulnerability. If we cannot update the parent package immediately, we force the workspace to use a patched version of the sub-dependency using `pnpm.overrides`.

**Example from `package.json`:**
```json
"pnpm": {
  "overrides": {
    "ip-address": "^10.1.1",
    "hono": "^4.12.16"
  }
}
```

### Active Overrides
- **`ip-address`**: Forced to `^10.1.1` to resolve a moderate vulnerability.
- **`hono`**: Forced to `^4.12.16` to resolve vulnerabilities in the body limit middleware and JSX engine (GHSA-9vqf-7f2p-gf9v and GHSA-69xw-7hcm-h432).

> [!IMPORTANT]
> After adding an override, you **must** run `pnpm install` to update the lockfile and then verify the fix by running `pnpm audit`. If the audit returns "No known vulnerabilities found", the fix is successful.

## 2. Static Code Security Linting (`eslint-plugin-security`)

Our ESLint configuration includes `eslint-plugin-security`, which scans the codebase for common Node.js vulnerabilities like:
- `security/detect-object-injection` (Dynamic object key access)
- `security/detect-non-literal-fs-filename` (Dynamic file system paths)
- `security/detect-possible-timing-attacks` (Insecure string comparison)

### The Frontend (React) vs. Backend (Node.js) Difference
The `eslint-plugin-security` rules are built primarily to defend **Node.js Backends** against malicious user requests that could compromise the server's file system or memory. When applied to frontend React code (`apps/web/**/*.tsx`) or test files, they generate "noise" rather than meaningful security value.

**Why we exclude the Frontend and Tests:**
- **Execution Context:** Frontend code runs locally in the buyer's own web browser. It does not run on our server. A user "hacking" their own browser's memory via an object injection only affects their own tab, not our central system.
- **No Server Access:** Browsers do not have a file system module (`fs`). Rules like `detect-non-literal-fs-filename` are literally impossible to violate in a React app because the browser cannot reach your server's hard drive.
- **Mocks in Tests:** Test files (`**/*.test.ts`) rely heavily on dynamic mocks and fake data. Applying backend security rules to test stubs leads to hundreds of false alarms without protecting any production code.
- **Avoiding Alert Fatigue:** By turning these rules off for the frontend and tests, we ensure that developers don't get used to ignoring warnings. This makes sure that when a warning *does* appear in the Backend, the team takes it 100% seriously.

**Solution:** We have explicitly disabled these security rules for all frontend and test paths inside `eslint.config.ts`. The **Backend API (`apps/api`)** remains under strict, line-by-line scrutiny.

### Silencing False Positives in the Backend
For the backend (`apps/api`), the security plugin is **fully active**. However, you will sometimes hit false positives. 

For instance, in `apps/api/src/config/env.ts`, we dynamically resolve the `.env` path relative to the workspace root:
```typescript
const envPath = path.resolve(workspaceRoot, ".env");
if (!existsSync(envPath)) {
  writeFileSync(envPath, "", { encoding: "utf8" });
}
```
ESLint will warn that `envPath` is not a literal string, fearing a Path Traversal attack. Because we know this is a trusted, internally-generated path during server startup, it is a **false positive**.

### Why We Use Line-by-Line Silencing
To silence a false positive, **never disable the rule for the whole file**. Instead, add `// eslint-disable-next-line [rule-name]` directly above the exact line.

**Example:**
```typescript
// eslint-disable-next-line security/detect-non-literal-fs-filename
if (!existsSync(envPath)) {
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  writeFileSync(envPath, "", { encoding: "utf8" });
}
```
**Why do this?** If a developer later comes into `env.ts` and adds a brand new route that reads a file directly from a user's `req.body.filename`, the security plugin **will still catch it and fail the CI**. By scoping the disable comment to exactly one line, the rest of the file remains 100% protected.

## 3. Enforcing Strict Linting in CI/CD

By silencing our known false-positives across the codebase, we established a "Secure Baseline" of zero warnings.

Because of this, we were able to update the CI pipeline script in `package.json` to enforce strict linting:
```json
"ci:quality": "... pnpm lint --max-warnings 0 ..."
```

**What this means for developers:**
If you write code that triggers a new security warning, the CI pipeline will instantly fail. You must either refactor the code to fix the vulnerability, or, if you have verified it is a false positive, explicitly add an `// eslint-disable-next-line` comment to bypass it. This guarantees that no security issues get accidentally ignored or buried in the console logs.
