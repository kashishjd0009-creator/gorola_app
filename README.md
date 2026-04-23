# GoRola App

GoRola is a premium quick-commerce platform for Mussoorie, India. This repository contains the monorepo for the backend API, frontend web app, and shared packages.

## Current Status

Phase 1 (NFR Foundation) is actively in progress.

Completed so far:

- Monorepo and workspace setup with strict TypeScript
- Prisma schema, migration, and seed setup
- Full repository layer for core domains
- Fastify server bootstrap with health route and standardized error envelope
- Integration test foundation for API repositories and server bootstrap

Next major milestone:

- Phase 1.5 authentication system (buyer OTP, store owner auth, admin auth)

## Monorepo Structure

```text
GoRola_app/
├── apps/
│   ├── api/                # Fastify + Prisma backend
│   └── web/                # React + Vite + TypeScript (buyer web)
├── packages/
│   ├── shared/             # Shared types and domain errors
│   └── ui/                 # Shared UI package scaffold
├── vercel.json             # Vercel: install / build / output (buyer web)
├── railway.toml            # Railway: API build + start
├── nixpacks.toml           # Railway Nixpacks: Node major
├── Procfile                # Railway: web process
├── .env.example
├── eslint.config.ts
├── package.json
├── pnpm-workspace.yaml
└── tsconfig.base.json
```

## Tech Stack

- Backend: Fastify, Prisma, PostgreSQL, Redis, Pino
- Frontend: React, Vite, TypeScript, Tailwind CSS
- Tooling: pnpm workspaces, ESLint, Prettier, TypeScript strict mode
- Testing: Vitest (API integration tests are active)
- **Deployment:** [Vercel](https://vercel.com) (static buyer web) + [Railway](https://railway.app) (Fastify API, PostgreSQL 15, Redis 7). GitHub Actions runs **CI then CD** on `main`. Native Git autodeploy is **off**; see [Deployment](#deployment) below.

## Prerequisites

- Node.js 22+ (see root `package.json` `engines` and `.nvmrc`)
- pnpm 10+
- PostgreSQL (dev + test databases)
- Redis (for app runtime features)

## Setup

1. Install dependencies:

   ```bash
   pnpm install
   ```

2. Create local env file:

   ```powershell
   Copy-Item .env.example .env
   ```

3. Fill `.env` values for database, Redis, JWT keys, and external services.

4. Generate Prisma client:

   ```bash
   pnpm --filter @gorola/api prisma:generate
   ```

5. Run migration in local DB:

   ```bash
   pnpm --filter @gorola/api prisma:migrate:dev --name init
   ```

6. Seed local data:

   ```bash
   pnpm --filter @gorola/api prisma:seed
   ```

## Root Workspace Commands

Run these from `GoRola_app` root:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

## API Commands

Useful commands in `@gorola/api`:

```bash
pnpm --filter @gorola/api lint
pnpm --filter @gorola/api typecheck
pnpm --filter @gorola/api test
pnpm --filter @gorola/api test:watch
pnpm --filter @gorola/api prisma:format
pnpm --filter @gorola/api prisma:validate
pnpm --filter @gorola/api prisma:generate
pnpm --filter @gorola/api prisma:migrate:dev
pnpm --filter @gorola/api prisma:seed
```

## Implemented API Domains (Repository Layer)

- `user`
- `store`
- `store-owner`
- `admin`
- `catalog` (`category`, `product`, `variant`)
- `cart`
- `order`
- `address`
- `promotion` (`advertisement`, `offer`, `discount`)
- `feature-flag`
- `audit`
- `delivery` (stub with not-implemented behavior)

## Environment Variables

Defined in `.env.example`:

- `DATABASE_URL`
- `DATABASE_URL_TEST`
- `REDIS_URL`
- `JWT_PRIVATE_KEY`
- `JWT_PUBLIC_KEY`
- `FAST2SMS_API_KEY`
- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`
- `CORS_ALLOWED_ORIGINS`
- `APP_ENV`
- `NODE_ENV`
- `LOG_LEVEL`
- `PORT`
- `FRONTEND_URL`
- `OTEL_EXPORTER_ENDPOINT`
- `DIRECT_URL`

**Frontend (build-time, public only):** see `apps/web/.env.example` (e.g. `VITE_API_BASE_URL`). Set real values in Vercel for Production and Preview, not in git.

## Deployment

Production layout: **React/Vite apps** are served from **Vercel**; the **Fastify API** runs on **Railway** with **PostgreSQL 15** and **Redis 7** as separate Railway services. External integrations (OTP, payments) are configured per environment in each platform’s dashboard.

**Single rule:** Anything that should **not** change on every deploy — **install command**, **build command**, **output directory** (Vercel), **build / start / restart** (Railway), **Node major** — lives in **committed** files in this repo. Avoid retyping the same values in a dashboard in a way that drifts from the repo; the repo is the source of truth.

**Never commit:** API keys, JWT private material, database passwords, `CORS_ALLOWED_ORIGINS` for real URLs, or provider secrets. Set those per environment in Vercel and Railway. Required **variable names** are listed in the monorepo root `.env.example`; the broader GoRola workspace also maintains `../project_data.json` (parent folder) for the full spec contract.

**Disabling platform Git autodeploy (so only CI/CD or manual release ships code):**

| Platform | How we turn off push-to-deploy from Git | Optional “as code” |
|----------|----------------------------------------|--------------------|
| **Vercel** | Project → **Settings** → *Build and Deployment* → **Ignored build step** → **Behavior: Don’t build anything** (command is `exit 0` — no build on Git-driven deploy attempts). | Root `vercel.json` includes `"git": { "deploymentEnabled": false }` so the repo records the same policy. |
| **Railway** | API service → **Settings** → **Source** (or **Git**): **Disconnect** the GitHub repository. New commits no longer auto-deploy; you trigger a deploy from Railway (CLI, dashboard, or API) or from GitHub Actions. | Not available in `railway.toml` (autodeploy is a connection/setting, not a build key). |

**Continuous delivery in this repo:** After the `ci` job passes on **push to `main`** (or a manual **Run workflow** on `main`), two jobs run **in parallel**: **deploy · Vercel** and **deploy · Railway** (see `.github/workflows/ci-cd.yml`). A **`paths` job** uses git diff (via [`dorny/paths-filter`](https://github.com/dorny/paths-filter)) with **watch-style globs** so **Vercel** deploys only when buyer-web–related files change, and **Railway** only when API-related paths change (aligned with the Railway dashboard `apps/**` + `packages/shared` idea). Root **workspace/lock** files are included under **both** filters so dependency or `tsconfig` changes can redeploy either side. **Manual** `workflow_dispatch` on `main` **skips** the path check and runs both deploys. Deploy jobs are skipped on **pull requests** and on **non-`main`** branches unless you change the `if:` conditions. Ensure the [GitHub Actions CD secrets](#github-actions-cd-repository-secrets) below are set, or those jobs will fail with a clear message.

### Vercel (buyer web, static)

- **Config:** Root `vercel.json` is the authority for `installCommand`, `buildCommand`, and `outputDirectory` for the buyer app, and for `git.deploymentEnabled` (autodeploy off).
- **Monorepo:** The Vercel project’s **root directory** should stay the **repository root** (not `apps/web` only) so `pnpm` workspaces and filters work. The Git repo can stay **connected** for PR metadata; with **Ignored build step** and `git.deploymentEnabled`, pushes do not run a production build until **GitHub Actions** runs `vercel pull` → `vercel build --prod` → `vercel deploy --prebuilt --prod` (or you deploy manually from the Vercel UI).
- **Node:** The repo targets **Node 22** (`.nvmrc`, root `engines`); the Vercel build uses the same install/build as in `vercel.json`.
- **Dashboard (still required):** set **public** env vars such as `VITE_API_BASE_URL` (no secrets in git), domains, and (if used) the **Ignored build step** as above.

`vercel.json` (repository root):

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "installCommand": "pnpm install",
  "buildCommand": "pnpm --filter @gorola/shared build && pnpm --filter @gorola/web build",
  "outputDirectory": "apps/web/dist",
  "git": { "deploymentEnabled": false }
}
```

### Railway (API)

- **Config:** `railway.toml` defines the Nixpacks **builder**, **buildCommand**, **startCommand**, and **restart** policy. `nixpacks.toml` pins **Node 22** for the Nixpacks image. `Procfile` sets the `web` process to match the start command.
- **Monorepo:** The Railway service **root directory** must be the **Git repo root** (`GoRola_app`) — not `apps/api` alone — so `pnpm-workspace.yaml` and `--filter` work. With **Git disconnected**, GitHub Actions runs **`npx @railway/cli@latest up --ci`** (uploads the checked-out monorepo; Nixpacks build runs on Railway) after CI passes.
- **Start behavior:** `pnpm --filter @gorola/api start` runs Prisma migrate deploy, then the compiled server. The API listens on the port the platform provides (e.g. `PORT` in `.env.example`).

`railway.toml` (repository root):

```toml
[build]
builder = "NIXPACKS"
buildCommand = "pnpm install --frozen-lockfile && pnpm --filter @gorola/shared build && pnpm --filter @gorola/api run build"

[deploy]
startCommand = "pnpm --filter @gorola/api start"
restartPolicyType = "on_failure"
```

`nixpacks.toml` (repository root):

```toml
[variables]
NODE_VERSION = "22"
```

`Procfile` (repository root):

```text
web: pnpm --filter @gorola/api start
```

`apps/api` scripts used by the deploy start command:

```json
"build": "prisma generate && tsc -p tsconfig.json",
"start": "prisma migrate deploy && node dist/app.js"
```

**Dashboard (still required on Railway):** add **PostgreSQL 15** and **Redis 7** plugins, link `DATABASE_URL`, `REDIS_URL`, and set secrets from the `.env.example` contract (JWT keys, `CORS_ALLOWED_ORIGINS`, `FAST2SMS_API_KEY`, OpenTelemetry, etc.).

**CORS:** `CORS_ALLOWED_ORIGINS` for the API must include your **Vercel** production origin and, if the browser calls the API from them, your **Vercel Preview** URLs as well.

**Further reading:** [Railway config as code](https://docs.railway.com/deploy/config-as-code), [Nixpacks Node](https://nixpacks.com/docs/providers/node).

### GitHub Actions CD (repository secrets)

Add these as **Settings → Secrets and variables → Actions → Repository secrets** in GitHub. They are only used by the `deploy-vercel` and `deploy-railway` jobs on `main`.

| Secret | Used by | Where to get it |
|--------|---------|-----------------|
| `VERCEL_TOKEN` | Vercel job | [Vercel](https://vercel.com/account/tokens) → *Create Token* (scope: account/team that owns the project). |
| `VERCEL_ORG_ID` | Vercel job | Your team’s **Team ID**: Vercel → team **Settings** → **General** → **Team ID** (same value as `"orgId"` in `.vercel/project.json` after `vercel link` at the monorepo root). |
| `VERCEL_PROJECT_ID` | Vercel job | *Project* → *Settings* → *General* → **Project ID**, or `projectId` in `.vercel/project.json`. |
| `RAILWAY_TOKEN` | Railway job | Prefer a **Project token** (Project → *Settings* → *Tokens*) for `railway up` in CI; an **account** token from [Account → Tokens](https://railway.com/account/tokens) can work but may need extra flags. |
| `RAILWAY_SERVICE_ID` | Railway job | The **Node API** service UUID (**not** the project id). From the **URL** with that service open: `.../service/<serviceId>/...`, or `npx @railway/cli@latest link` → `.railway/`. |

`VERCEL_ORG_ID` and `VERCEL_PROJECT_ID` (with `VERCEL_TOKEN`) are what the Vercel CLI uses for `vercel pull` / `vercel build` / `vercel deploy --prebuilt` in CI (no interactive link). **Railway** only needs `RAILWAY_TOKEN` and `RAILWAY_SERVICE_ID` (project token implies the target environment; `railway up` uses `--service` only).

**Invalid `RAILWAY_TOKEN` in Actions:** Regenerate a token from **the same Railway project** you deploy to — use **Project → Settings → Tokens** (project-scoped) when possible, not an expired or wrong-workspace key.

**Railway vs raw GraphQL:** The workflow uses the **Railway CLI** (`railway up --ci` after `npm install -g @railway/cli`); the old public GraphQL `deploymentTrigger` mutation is not on the current schema. Build runs on Railway’s side after the repo upload. Each run passes `--message` built from `git log -1 --oneline` (short SHA + first line of the commit message) so the deployment list is not only the generic “railway up” label. Removing the Git source in Railway is fine; the message still reflects the **checkout in Actions** (the commit you just pushed or the ref you run manually).

## Quality Gate

Before committing:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

---

GoRola - Mussoorie, delivered.
