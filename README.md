# GoRola App

GoRola is a premium quick-commerce platform focused on Mussoorie, India. This repository contains the monorepo foundation for the platform: backend API, frontend web app, and shared packages.

## Current Status

This repository is in the **foundation stage**:

- Monorepo and workspace tooling are set up
- Strict TypeScript, ESLint, Prettier, and env validation are configured
- API, web, and shared packages are scaffolded
- Feature modules and business logic are planned but not fully implemented yet

## Monorepo Structure

```text
GoRola_app/
├── apps/
│   ├── api/          # Fastify + TypeScript backend (bootstrap scaffold)
│   └── web/          # React/Vite frontend (bootstrap scaffold)
├── packages/
│   ├── shared/       # Shared types and schemas
│   └── ui/           # Shared UI package scaffold
├── .env.example
├── eslint.config.ts
├── package.json
├── pnpm-workspace.yaml
└── tsconfig.base.json
```

## Tech Stack

- Backend: Fastify, TypeScript, Prisma, PostgreSQL, Redis, BullMQ
- Frontend: React, Vite, Tailwind CSS, shadcn/ui
- Tooling: pnpm workspaces, ESLint, Prettier, TypeScript strict mode
- Testing (target): Vitest, Supertest, Playwright

## Prerequisites

- Node.js 20+
- pnpm 10+

## Getting Started

1. Install dependencies:

   ```bash
   pnpm install
   ```

2. Create local env file from the template:

   ```bash
   cp .env.example .env
   ```

   On Windows PowerShell:

   ```powershell
   Copy-Item .env.example .env
   ```

3. Fill required values in `.env`.

The API currently validates environment variables at startup using `dotenv-safe` and `.env.example`.

## Workspace Commands

Run from repository root (`GoRola_app`):

- Lint all packages:

  ```bash
  pnpm lint
  ```

- Typecheck all packages:

  ```bash
  pnpm typecheck
  ```

- Run all package test scripts:

  ```bash
  pnpm test
  ```

- Build all packages:

  ```bash
  pnpm build
  ```

## Package Scripts

- `apps/api`: `build`, `typecheck`, `lint`, `test` (placeholder)
- `apps/web`: `build`, `typecheck`, `lint`, `test` (placeholder)
- `packages/shared`: `build`, `typecheck`, `lint`, `test` (placeholder)

## Quality Gates

Before committing changes, run:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

## Environment Variables

Defined in `.env.example`:

- `DATABASE_URL`
- `REDIS_URL`
- `JWT_PRIVATE_KEY`
- `JWT_PUBLIC_KEY`
- `FAST2SMS_API_KEY`
- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`
- `CORS_ALLOWED_ORIGINS`
- `NODE_ENV`
- `LOG_LEVEL`
- `PORT`
- `FRONTEND_URL`
- `OTEL_EXPORTER_ENDPOINT`

## Next Planned Work

- Prisma schema and initial migrations
- Repository layer and module scaffolding
- Fastify server bootstrap and health endpoints
- Authentication flows (buyer OTP, store owner, admin)
- CI/CD pipelines and deployment setup

---

GoRola - Mussoorie, delivered.
