# CI Performance Optimization & Caching Strategy

This guide establishes the strategy for maintaining a fast, high-performance Continuous Integration (CI) pipeline, reducing cycle times from 5+ minutes down to 2-3 minutes.

---

## 1. The Problem: The "Fresh Install" Bottleneck

In a standard CI environment (like GitHub Actions), every job starts from a blank slate. This means:
1.  **Dependencies**: `pnpm install` downloads hundreds of megabytes of packages every time.
2.  **Browsers**: `playwright install` downloads ~500MB of browser binaries (Chromium, Firefox, etc.) on every run.
3.  **OS Dependencies**: Installing Linux system libraries for browsers adds extra overhead.

Without caching, these steps dominate the CI runtime, frustrating developers and delaying feedback.

---

## 2. Layered Caching Strategy

We implement a two-layer caching strategy in `.github/workflows/ci.yml`.

### **Layer A: pnpm Store Caching**
Instead of downloading packages, we cache the local pnpm store.
- **Key**: Hashed from `pnpm-lock.yaml`. 
- **Behavior**: If the lockfile doesn't change, the install step takes ~10 seconds instead of 1-2 minutes.

### **Layer B: Playwright Browser Caching**
We cache the `~/.cache/ms-playwright` directory.
- **Problem**: Playwright binaries change with every version update.
- **Solution**: We dynamically extract the Playwright version from `package.json` and use it in the cache key.
- **Logic**:
    - If **HIT**: Skip `playwright install`. Only run `install-deps` (fast OS libraries).
    - If **MISS**: Run full `playwright install --with-deps`.

```yaml
# Extract version for the cache key
- name: Get Playwright version
  id: playwright-version
  run: echo "version=$(pnpm list --filter @gorola/web @playwright/test --json | jq -r '.[0].devDependencies["@playwright/test"].version')" >> $GITHUB_OUTPUT

- name: Cache Playwright Browsers
  uses: actions/cache@v4
  with:
    path: ~/.cache/ms-playwright
    key: playwright-${{ runner.os }}-${{ steps.playwright-version.outputs.version }}
```

---

## 3. Cache Isolation & Branch Protection

### **The Isolation Rule**
GitHub caches are scoped by **branch**. 
1.  **PR Branches**: Can read caches from their base branch (e.g., `main` or `develop`).
2.  **Base Branches**: **Cannot** read caches from child PR branches.

**DX Tip**: When you first add caching, your PR will show a "Miss" (it's saving the cache). When you merge, the first run on `develop` will also "Miss" (it's creating the master cache). The **third** run is when you will feel the speed.

### **Branch Protection (The Quality Gate)**
To ensure the main codebase never breaks, we enforce **Status Checks**:
- **Rule**: The `ci` job must pass before a Pull Request can be merged.
- **Config**: Set in **GitHub Settings -> Branches -> Branch Protection Rules**.
- **Impact**: This ensures that every line of code in `develop`/`main` has already passed Lint, Typecheck, Build, and 34+ E2E tests.

---

## 4. Maintenance & Piling

1.  **Lockfile Updates**: If you update a dependency, the cache will naturally "Miss" once, rebuild, and then become fast again.
2.  **Playwright Updates**: If you upgrade Playwright, the dynamic version key will automatically handle the cache rotation—no manual intervention required.
3.  **Cache Cleanup**: GitHub automatically deletes caches that haven't been accessed in 7 days.

---

## Summary for Future Projects
1.  **Always** cache the package manager store (pnpm/npm/yarn).
2.  **Pin** tool caches (like Playwright) to their version string.
3.  **Use** OS-specific keys (`runner.os`) to prevent binary compatibility issues.
4.  **Protect** your main branches by requiring CI success as a merge condition.
