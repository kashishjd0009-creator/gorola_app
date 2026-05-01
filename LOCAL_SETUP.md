# GoRola Local Setup Guide

This guide will help you set up the GoRola monorepo on your local machine using Docker for infrastructure (PostgreSQL & Redis).

## 1. Prerequisites

- **Node.js**: Version 22 or higher.
- **pnpm**: Version 10 or higher (`npm install -g pnpm`).
- **Docker**: For running the database and cache.

---

## 2. Infrastructure (Docker)

Run the following commands to start the required services in the background:

### Redis
```powershell
docker run -d --name gorola-redis -p 6379:6379 redis:7
```

### PostgreSQL
```powershell
docker run -d --name gorola-postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=gorola_dev -p 5432:5432 postgres:15
```

> [!TIP]
> **Database Credentials**: 
> - **User**: `postgres`
> - **Password**: `postgres`
> - **Database**: `gorola_dev`
> - **Host**: `localhost`
> - **Port**: `5432`

---

## 3. Environment Variables

1.  Navigate to the `GoRola_app` directory.
2.  Copy the example env file:
    ```powershell
    cp .env.example .env
    ```
3.  Update the `.env` file with these values (using quotes for safety):
    ```env
    DATABASE_URL="postgresql://postgres:postgres@localhost:5432/gorola_dev"
    REDIS_URL="redis://localhost:6379"
    
    # JWT keys can be left blank for local development
    ```

---

## 4. Installation & Setup

Run these commands from the `GoRola_app` root:

1.  **Install dependencies**:
    ```powershell
    pnpm install
    ```
2.  **Generate Prisma client**:
    ```powershell
    pnpm --filter @gorola/api prisma:generate
    ```
3.  **Apply migrations**:
    ```powershell
    pnpm --filter @gorola/api prisma:migrate:dev --name init
    ```
4.  **Seed data**:
    ```powershell
    pnpm --filter @gorola/api prisma:seed
    ```
5.  **Build shared packages**:
    ```powershell
    pnpm --filter @gorola/shared build
    ```

---

## 5. Running the Application

### Start the Backend (API)
```powershell
pnpm --filter @gorola/api dev
```
*(If `dev` is not defined, use `pnpm --filter @gorola/api start`)*

### Start the Frontend (Web)
```powershell
pnpm --filter @gorola/web dev
```

The app will be available at:
- **Frontend**: http://localhost:5173
- **API**: http://localhost:3001

---

## Alternative: Using Docker Compose
If you prefer, you can create a `docker-compose.yml` in the root and run `docker-compose up -d` to start both services at once:

```yaml
services:
  postgres:
    image: postgres:15
    container_name: gorola-postgres
    environment:
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: gorola_dev
    ports:
      - "5432:5432"
  redis:
    image: redis:7
    container_name: gorola-redis
    ports:
      - "6379:6379"
```
