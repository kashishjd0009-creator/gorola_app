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
│   └── web/                # React/Vite frontend scaffold
├── packages/
│   ├── shared/             # Shared types and domain errors
│   └── ui/                 # Shared UI package scaffold
├── .env.example
├── eslint.config.ts
├── package.json
├── pnpm-workspace.yaml
└── tsconfig.base.json
```

## Tech Stack

- Backend: Fastify, Prisma, PostgreSQL, Redis, Pino
- Frontend: React + Vite (scaffold stage)
- Tooling: pnpm workspaces, ESLint, Prettier, TypeScript strict mode
- Testing: Vitest (API integration tests are active)

## Prerequisites

- Node.js 20+
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
