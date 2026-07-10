# Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stand up the GerenciadorAlunos monorepo — Fastify+Prisma+Postgres backend, React+Vite frontend, JWT auth, and a full Escolas CRUD module that proves the `UI → Service → Repository → Database` layering every later module (Turmas, Alunos, Faltas, Desempenho...) will repeat.

**Architecture:** pnpm-workspace monorepo with `backend/` and `frontend/`. Both packages use a `core/` (never imports `modules/`), `shared/`, and `modules/<name>/` layout. Backend modules are `routes → service → repository → Prisma`. Frontend modules are `pages → hooks/components → service → API`.

**Tech Stack:** Fastify, TypeScript (strict), Prisma, PostgreSQL, React, Vite, Vitest, ESLint, Prettier, pnpm workspaces, bcrypt, jsonwebtoken.

## Global Constraints

- TypeScript strict mode everywhere.
- `core/` never imports from `modules/` — in either package.
- Backend tests run against a real Postgres test database — do not mock Prisma/the DB.
- Auth: JWT access token (short-lived) + refresh token, both httpOnly cookies. No roles/permissions — any authenticated user has full access.
- No self-registration — first admin user comes from a seed script reading env vars.
- `Escola.ativo` soft delete only — never hard-delete (future modules FK to Escola).
- Package manager is pnpm — never use npm/yarn commands.

---

## File Structure

```
GerenciadorAlunos/
├── package.json                      # root workspace scripts
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── .eslintrc.cjs
├── .prettierrc
├── .gitignore
├── docker-compose.yml                # Postgres for dev + tests
├── backend/
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env.example
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   └── src/
│       ├── core/
│       │   ├── config.ts
│       │   ├── prisma.ts
│       │   ├── jwt.ts
│       │   ├── password.ts
│       │   └── auth-hook.ts
│       ├── auth/
│       │   ├── auth.routes.ts
│       │   ├── auth.service.ts
│       │   ├── auth.types.ts
│       │   └── auth.test.ts
│       ├── modules/
│       │   └── escolas/
│       │       ├── escolas.routes.ts
│       │       ├── escolas.service.ts
│       │       ├── escolas.repository.ts
│       │       ├── escolas.types.ts
│       │       └── escolas.test.ts
│       ├── app.ts
│       └── server.ts
└── frontend/
    ├── package.json
    ├── tsconfig.json
    ├── vite.config.ts
    ├── index.html
    ├── .env.example
    └── src/
        ├── core/
        │   ├── apiClient.ts
        │   ├── router.tsx
        │   └── Layout.tsx
        ├── shared/
        │   └── components/
        │       ├── Table.tsx
        │       ├── Modal.tsx
        │       └── Button.tsx
        ├── auth/
        │   ├── AuthContext.tsx
        │   ├── auth.service.ts
        │   ├── LoginPage.tsx
        │   └── RouteGuard.tsx
        ├── modules/
        │   └── escolas/
        │       ├── types.ts
        │       ├── services/escolas.service.ts
        │       ├── hooks/useEscolas.ts
        │       ├── components/EscolaForm.tsx
        │       ├── components/EscolaList.tsx
        │       ├── components/EscolaList.test.tsx
        │       └── pages/EscolasPage.tsx
        ├── App.tsx
        └── main.tsx
```

---

### Task 1: Monorepo scaffold

**Files:**
- Create: `package.json`
- Create: `pnpm-workspace.yaml`
- Create: `tsconfig.base.json`
- Create: `.eslintrc.cjs`
- Create: `.prettierrc`
- Create: `.gitignore`
- Create: `docker-compose.yml`

**Interfaces:**
- Produces: root pnpm workspace containing `backend` and `frontend` packages; root scripts `dev`, `build`, `test`, `lint` that fan out via `pnpm -r`/`--filter`; a `postgres` docker-compose service listening on `5432` with db `gerenciador_alunos`, user `postgres`, password `postgres`.

- [ ] **Step 1: Create `pnpm-workspace.yaml`**

```yaml
packages:
  - "backend"
  - "frontend"
```

- [ ] **Step 2: Create root `package.json`**

```json
{
  "name": "gerenciador-alunos",
  "private": true,
  "scripts": {
    "dev": "pnpm -r --parallel run dev",
    "build": "pnpm -r run build",
    "test": "pnpm -r run test",
    "lint": "pnpm -r run lint"
  },
  "devDependencies": {
    "eslint": "^9.9.0",
    "prettier": "^3.3.3",
    "typescript": "^5.5.4"
  }
}
```

- [ ] **Step 3: Create `tsconfig.base.json`**

```json
{
  "compilerOptions": {
    "strict": true,
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": false,
    "sourceMap": true
  }
}
```

- [ ] **Step 4: Create `.eslintrc.cjs`**

```js
module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "prettier"
  ],
  env: { node: true, es2022: true },
  parserOptions: { ecmaVersion: 2022, sourceType: "module" },
  rules: {}
};
```

- [ ] **Step 5: Create `.prettierrc`**

```json
{
  "semi": true,
  "singleQuote": false,
  "trailingComma": "none",
  "printWidth": 100
}
```

- [ ] **Step 6: Create `.gitignore`**

```
node_modules/
dist/
build/
.env
*.log
.DS_Store
```

- [ ] **Step 7: Create `docker-compose.yml`**

```yaml
services:
  postgres:
    image: postgres:16
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: gerenciador_alunos
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:
```

- [ ] **Step 8: Verify workspace file validity**

Run: `pnpm install`
Expected: completes without error (no packages yet besides root devDependencies).

- [ ] **Step 9: Commit**

```bash
git add package.json pnpm-workspace.yaml tsconfig.base.json .eslintrc.cjs .prettierrc .gitignore docker-compose.yml
git commit -m "chore: scaffold monorepo workspace, tooling config, postgres compose"
```

---

### Task 2: Backend package init + Fastify skeleton

**Files:**
- Create: `backend/package.json`
- Create: `backend/tsconfig.json`
- Create: `backend/.env.example`
- Create: `backend/src/core/config.ts`
- Create: `backend/src/app.ts`
- Create: `backend/src/server.ts`
- Test: `backend/src/app.test.ts`

**Interfaces:**
- Produces: `buildApp(): FastifyInstance` from `backend/src/app.ts` (async factory, registers `@fastify/cookie` and CORS, exposes `GET /health` returning `{ status: "ok" }`). `loadConfig(): Config` from `backend/src/core/config.ts` returning `{ port: number, databaseUrl: string, jwtAccessSecret: string, jwtRefreshSecret: string }`, reading from `process.env`, throwing if a required var is missing.

- [ ] **Step 1: Create `backend/package.json`**

```json
{
  "name": "backend",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "build": "tsc -p tsconfig.json",
    "start": "node dist/server.js",
    "test": "vitest run",
    "lint": "eslint src --ext .ts"
  },
  "dependencies": {
    "fastify": "^4.28.1",
    "@fastify/cookie": "^9.4.0",
    "@fastify/cors": "^9.0.1",
    "@prisma/client": "^5.18.0",
    "bcrypt": "^5.1.1",
    "jsonwebtoken": "^9.0.2",
    "zod": "^3.23.8"
  },
  "devDependencies": {
    "@types/bcrypt": "^5.0.2",
    "@types/jsonwebtoken": "^9.0.6",
    "@types/node": "^22.5.0",
    "prisma": "^5.18.0",
    "tsx": "^4.19.0",
    "vitest": "^2.0.5"
  }
}
```

- [ ] **Step 2: Create `backend/tsconfig.json`**

```json
{
  "extends": "../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src"]
}
```

- [ ] **Step 3: Create `backend/.env.example`**

```
PORT=3000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/gerenciador_alunos
JWT_ACCESS_SECRET=change-me-access
JWT_REFRESH_SECRET=change-me-refresh
ADMIN_SEED_EMAIL=admin@example.com
ADMIN_SEED_PASSWORD=change-me-admin-password
```

- [ ] **Step 4: Copy `.env.example` to `.env` for local dev**

Run: `cp backend/.env.example backend/.env`
Expected: `backend/.env` exists (gitignored).

- [ ] **Step 5: Create `backend/src/core/config.ts`**

```typescript
export interface Config {
  port: number;
  databaseUrl: string;
  jwtAccessSecret: string;
  jwtRefreshSecret: string;
}

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

export function loadConfig(): Config {
  return {
    port: Number(process.env.PORT ?? 3000),
    databaseUrl: required("DATABASE_URL"),
    jwtAccessSecret: required("JWT_ACCESS_SECRET"),
    jwtRefreshSecret: required("JWT_REFRESH_SECRET")
  };
}
```

- [ ] **Step 6: Write the failing test for `buildApp`**

Create `backend/src/app.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { buildApp } from "./app.js";

describe("app", () => {
  it("responds ok on GET /health", async () => {
    const app = await buildApp();
    const response = await app.inject({ method: "GET", url: "/health" });
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ status: "ok" });
    await app.close();
  });
});
```

- [ ] **Step 7: Run test to verify it fails**

Run: `pnpm --filter backend test`
Expected: FAIL — `app.ts` does not exist yet (`Cannot find module './app.js'`).

- [ ] **Step 8: Create `backend/src/app.ts`**

```typescript
import Fastify, { FastifyInstance } from "fastify";
import cookie from "@fastify/cookie";
import cors from "@fastify/cors";

export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({ logger: false });

  await app.register(cors, { origin: true, credentials: true });
  await app.register(cookie);

  app.get("/health", async () => ({ status: "ok" }));

  return app;
}
```

- [ ] **Step 9: Run test to verify it passes**

Run: `pnpm --filter backend test`
Expected: PASS

- [ ] **Step 10: Create `backend/src/server.ts`**

```typescript
import { buildApp } from "./app.js";
import { loadConfig } from "./core/config.js";

async function main() {
  const config = loadConfig();
  const app = await buildApp();
  await app.listen({ port: config.port, host: "0.0.0.0" });
  console.log(`Server listening on port ${config.port}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
```

- [ ] **Step 11: Install backend dependencies**

Run: `pnpm install`
Expected: `backend/node_modules` populated, lockfile updated.

- [ ] **Step 12: Start server manually and verify**

Run: `pnpm --filter backend dev` (in background), then `curl http://localhost:3000/health`
Expected: `{"status":"ok"}`. Stop the dev server after checking.

- [ ] **Step 13: Commit**

```bash
git add backend/package.json backend/tsconfig.json backend/.env.example backend/src/core/config.ts backend/src/app.ts backend/src/app.test.ts backend/src/server.ts pnpm-lock.yaml
git commit -m "feat(backend): scaffold Fastify app with health check"
```

---

### Task 3: Prisma schema + migration (User, Escola)

**Files:**
- Create: `backend/prisma/schema.prisma`
- Create: `backend/src/core/prisma.ts`

**Interfaces:**
- Consumes: `Config.databaseUrl` from Task 2's `loadConfig()`.
- Produces: `prisma` singleton (`PrismaClient` instance) exported from `backend/src/core/prisma.ts`; Prisma models `User { id, email, passwordHash, name, createdAt }` and `Escola { id, nome, cnpj, endereco, telefone, ativo, createdAt, updatedAt }`, both used by Tasks 5 and 7.

- [ ] **Step 1: Create `backend/prisma/schema.prisma`**

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id           String   @id @default(uuid())
  email        String   @unique
  passwordHash String
  name         String
  createdAt    DateTime @default(now())
}

model Escola {
  id        String   @id @default(uuid())
  nome      String
  cnpj      String?  @unique
  endereco  String?
  telefone  String?
  ativo     Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

- [ ] **Step 2: Start local Postgres**

Run: `docker compose up -d postgres`
Expected: container running, port 5432 accepting connections (`docker compose ps` shows `healthy` or `running`).

- [ ] **Step 3: Run initial migration**

Run: `pnpm --filter backend exec prisma migrate dev --name init`
Expected: creates `backend/prisma/migrations/<timestamp>_init/migration.sql`, applies it, generates Prisma client. Output ends with "Your database is now in sync with your schema."

- [ ] **Step 4: Create `backend/src/core/prisma.ts`**

```typescript
import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();
```

- [ ] **Step 5: Verify Prisma client compiles against schema**

Run: `pnpm --filter backend exec tsc --noEmit`
Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add backend/prisma backend/src/core/prisma.ts
git commit -m "feat(backend): add Prisma schema for User and Escola, run initial migration"
```

---

### Task 4: Core auth utilities (JWT + password hashing)

**Files:**
- Create: `backend/src/core/jwt.ts`
- Create: `backend/src/core/jwt.test.ts`
- Create: `backend/src/core/password.ts`
- Create: `backend/src/core/password.test.ts`

**Interfaces:**
- Produces: `signAccessToken(userId: string, secret: string): string`, `signRefreshToken(userId: string, secret: string): string`, `verifyToken(token: string, secret: string): { userId: string }` (throws on invalid/expired) from `backend/src/core/jwt.ts`. `hashPassword(plain: string): Promise<string>`, `comparePassword(plain: string, hash: string): Promise<boolean>` from `backend/src/core/password.ts`. Both consumed by Task 5 (`auth.service.ts`) and Task 6 (seed script).

- [ ] **Step 1: Write failing test for password hashing**

Create `backend/src/core/password.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { hashPassword, comparePassword } from "./password.js";

describe("password", () => {
  it("hashes a password and verifies it matches", async () => {
    const hash = await hashPassword("s3cret!");
    expect(hash).not.toBe("s3cret!");
    expect(await comparePassword("s3cret!", hash)).toBe(true);
  });

  it("rejects a wrong password", async () => {
    const hash = await hashPassword("s3cret!");
    expect(await comparePassword("wrong", hash)).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter backend test password`
Expected: FAIL — `./password.js` not found.

- [ ] **Step 3: Create `backend/src/core/password.ts`**

```typescript
import bcrypt from "bcrypt";

const SALT_ROUNDS = 10;

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

export async function comparePassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm --filter backend test password`
Expected: PASS

- [ ] **Step 5: Write failing test for JWT helpers**

Create `backend/src/core/jwt.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { signAccessToken, verifyToken } from "./jwt.js";

describe("jwt", () => {
  it("signs and verifies an access token", () => {
    const token = signAccessToken("user-123", "test-secret");
    const payload = verifyToken(token, "test-secret");
    expect(payload.userId).toBe("user-123");
  });

  it("throws on wrong secret", () => {
    const token = signAccessToken("user-123", "test-secret");
    expect(() => verifyToken(token, "other-secret")).toThrow();
  });
});
```

- [ ] **Step 6: Run test to verify it fails**

Run: `pnpm --filter backend test jwt`
Expected: FAIL — `./jwt.js` not found.

- [ ] **Step 7: Create `backend/src/core/jwt.ts`**

```typescript
import jwt from "jsonwebtoken";

export interface TokenPayload {
  userId: string;
}

export function signAccessToken(userId: string, secret: string): string {
  return jwt.sign({ userId }, secret, { expiresIn: "15m" });
}

export function signRefreshToken(userId: string, secret: string): string {
  return jwt.sign({ userId }, secret, { expiresIn: "7d" });
}

export function verifyToken(token: string, secret: string): TokenPayload {
  const decoded = jwt.verify(token, secret);
  if (typeof decoded === "string" || !("userId" in decoded)) {
    throw new Error("Invalid token payload");
  }
  return { userId: decoded.userId as string };
}
```

- [ ] **Step 8: Run test to verify it passes**

Run: `pnpm --filter backend test jwt`
Expected: PASS

- [ ] **Step 9: Commit**

```bash
git add backend/src/core/jwt.ts backend/src/core/jwt.test.ts backend/src/core/password.ts backend/src/core/password.test.ts
git commit -m "feat(backend): add JWT and password hashing core utilities"
```

---

### Task 5: Auth module (login, refresh, logout, auth hook)

**Files:**
- Create: `backend/src/auth/auth.types.ts`
- Create: `backend/src/auth/auth.service.ts`
- Create: `backend/src/auth/auth.routes.ts`
- Create: `backend/src/auth/auth.test.ts`
- Create: `backend/src/core/auth-hook.ts`
- Modify: `backend/src/app.ts`

**Interfaces:**
- Consumes: `prisma` (Task 3), `hashPassword`/`comparePassword` (Task 4), `signAccessToken`/`signRefreshToken`/`verifyToken` (Task 4), `loadConfig()` (Task 2).
- Produces: `registerAuthRoutes(app: FastifyInstance, config: Config): void` mounting `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout`. `requireAuth(config: Config)` returns a Fastify `preHandler` that reads the `access_token` cookie, verifies it, and sets `request.user = { id: string }`, or replies `401`. Both consumed by Task 8 (`escolas.routes.ts`) to protect endpoints, and by `app.ts`.

- [ ] **Step 1: Create `backend/src/auth/auth.types.ts`**

```typescript
export interface LoginBody {
  email: string;
  password: string;
}

declare module "fastify" {
  interface FastifyRequest {
    user?: { id: string };
  }
}
```

- [ ] **Step 2: Write failing test for login flow**

Create `backend/src/auth/auth.test.ts`:

```typescript
import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import { buildApp } from "../app.js";
import { prisma } from "../core/prisma.js";
import { hashPassword } from "../core/password.js";
import type { FastifyInstance } from "fastify";

describe("auth routes", () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildApp();
  });

  afterAll(async () => {
    await app.close();
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    await prisma.user.deleteMany();
    await prisma.user.create({
      data: {
        email: "admin@example.com",
        passwordHash: await hashPassword("correct-password"),
        name: "Admin"
      }
    });
  });

  it("logs in with correct credentials and sets cookies", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/auth/login",
      payload: { email: "admin@example.com", password: "correct-password" }
    });

    expect(response.statusCode).toBe(200);
    const cookies = response.cookies.map((c) => c.name);
    expect(cookies).toContain("access_token");
    expect(cookies).toContain("refresh_token");
  });

  it("rejects wrong password", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/auth/login",
      payload: { email: "admin@example.com", password: "wrong" }
    });

    expect(response.statusCode).toBe(401);
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `pnpm --filter backend test auth`
Expected: FAIL — route `/auth/login` returns 404 (not registered yet).

- [ ] **Step 4: Create `backend/src/auth/auth.service.ts`**

```typescript
import { prisma } from "../core/prisma.js";
import { comparePassword } from "../core/password.js";
import { signAccessToken, signRefreshToken } from "../core/jwt.js";
import type { Config } from "../core/config.js";

export class InvalidCredentialsError extends Error {}

export async function login(email: string, password: string, config: Config) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new InvalidCredentialsError();
  }

  const valid = await comparePassword(password, user.passwordHash);
  if (!valid) {
    throw new InvalidCredentialsError();
  }

  return {
    userId: user.id,
    accessToken: signAccessToken(user.id, config.jwtAccessSecret),
    refreshToken: signRefreshToken(user.id, config.jwtRefreshSecret)
  };
}
```

- [ ] **Step 5: Create `backend/src/core/auth-hook.ts`**

```typescript
import type { FastifyReply, FastifyRequest } from "fastify";
import { verifyToken } from "./jwt.js";
import type { Config } from "./config.js";

export function requireAuth(config: Config) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const token = request.cookies.access_token;
    if (!token) {
      return reply.code(401).send({ error: "Unauthorized" });
    }

    try {
      const payload = verifyToken(token, config.jwtAccessSecret);
      request.user = { id: payload.userId };
    } catch {
      return reply.code(401).send({ error: "Unauthorized" });
    }
  };
}
```

- [ ] **Step 6: Create `backend/src/auth/auth.routes.ts`**

```typescript
import type { FastifyInstance } from "fastify";
import { login, InvalidCredentialsError } from "./auth.service.js";
import { signAccessToken, verifyToken } from "../core/jwt.js";
import type { Config } from "../core/config.js";
import type { LoginBody } from "./auth.types.js";

const COOKIE_OPTS = { httpOnly: true, path: "/", sameSite: "lax" as const };

export function registerAuthRoutes(app: FastifyInstance, config: Config) {
  app.post<{ Body: LoginBody }>("/auth/login", async (request, reply) => {
    try {
      const { email, password } = request.body;
      const result = await login(email, password, config);
      reply.setCookie("access_token", result.accessToken, COOKIE_OPTS);
      reply.setCookie("refresh_token", result.refreshToken, COOKIE_OPTS);
      return { userId: result.userId };
    } catch (err) {
      if (err instanceof InvalidCredentialsError) {
        return reply.code(401).send({ error: "Invalid credentials" });
      }
      throw err;
    }
  });

  app.post("/auth/refresh", async (request, reply) => {
    const refreshToken = request.cookies.refresh_token;
    if (!refreshToken) {
      return reply.code(401).send({ error: "Unauthorized" });
    }
    try {
      const payload = verifyToken(refreshToken, config.jwtRefreshSecret);
      const accessToken = signAccessToken(payload.userId, config.jwtAccessSecret);
      reply.setCookie("access_token", accessToken, COOKIE_OPTS);
      return { ok: true };
    } catch {
      return reply.code(401).send({ error: "Unauthorized" });
    }
  });

  app.post("/auth/logout", async (_request, reply) => {
    reply.clearCookie("access_token", { path: "/" });
    reply.clearCookie("refresh_token", { path: "/" });
    return { ok: true };
  });
}
```

- [ ] **Step 7: Wire auth routes into `app.ts`**

Modify `backend/src/app.ts`:

```typescript
import Fastify, { FastifyInstance } from "fastify";
import cookie from "@fastify/cookie";
import cors from "@fastify/cors";
import { loadConfig } from "./core/config.js";
import { registerAuthRoutes } from "./auth/auth.routes.js";

export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({ logger: false });
  const config = loadConfig();

  await app.register(cors, { origin: true, credentials: true });
  await app.register(cookie);

  app.get("/health", async () => ({ status: "ok" }));

  registerAuthRoutes(app, config);

  return app;
}
```

- [ ] **Step 8: Run test to verify it passes**

Run: `pnpm --filter backend test auth`
Expected: PASS (both login tests). Run `pnpm --filter backend test` for full suite — all green.

- [ ] **Step 9: Commit**

```bash
git add backend/src/auth backend/src/core/auth-hook.ts backend/src/app.ts
git commit -m "feat(backend): add JWT auth login/refresh/logout and requireAuth hook"
```

---

### Task 6: Admin seed script

**Files:**
- Create: `backend/prisma/seed.ts`
- Modify: `backend/package.json`

**Interfaces:**
- Consumes: `prisma` (Task 3), `hashPassword` (Task 4), env vars `ADMIN_SEED_EMAIL`/`ADMIN_SEED_PASSWORD` (Task 2's `.env.example`).
- Produces: idempotent `pnpm --filter backend prisma db seed` command that upserts one admin `User`.

- [ ] **Step 1: Create `backend/prisma/seed.ts`**

```typescript
import { prisma } from "../src/core/prisma.js";
import { hashPassword } from "../src/core/password.js";

async function main() {
  const email = process.env.ADMIN_SEED_EMAIL;
  const password = process.env.ADMIN_SEED_PASSWORD;

  if (!email || !password) {
    throw new Error("ADMIN_SEED_EMAIL and ADMIN_SEED_PASSWORD must be set");
  }

  const passwordHash = await hashPassword(password);

  await prisma.user.upsert({
    where: { email },
    update: {},
    create: { email, passwordHash, name: "Admin" }
  });

  console.log(`Seeded admin user: ${email}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
```

- [ ] **Step 2: Add `prisma.seed` config to `backend/package.json`**

Add this top-level key alongside `"scripts"`:

```json
  "prisma": {
    "seed": "tsx prisma/seed.ts"
  }
```

- [ ] **Step 3: Run the seed script**

Run: `pnpm --filter backend exec prisma db seed`
Expected: prints `Seeded admin user: admin@example.com` (or whatever `.env` has set).

- [ ] **Step 4: Verify idempotency**

Run: `pnpm --filter backend exec prisma db seed` again
Expected: no error, no duplicate user (upsert), same output line.

- [ ] **Step 5: Verify login works with seeded admin**

Run: `pnpm --filter backend dev` (background), then:
`curl -i -X POST http://localhost:3000/auth/login -H "Content-Type: application/json" -d "{\"email\":\"admin@example.com\",\"password\":\"<ADMIN_SEED_PASSWORD from .env>\"}"`
Expected: `200 OK`, response sets `access_token` and `refresh_token` cookies. Stop the dev server after checking.

- [ ] **Step 6: Commit**

```bash
git add backend/prisma/seed.ts backend/package.json
git commit -m "feat(backend): add idempotent admin user seed script"
```

---

### Task 7: Escolas repository + service

**Files:**
- Create: `backend/src/modules/escolas/escolas.types.ts`
- Create: `backend/src/modules/escolas/escolas.repository.ts`
- Create: `backend/src/modules/escolas/escolas.service.ts`
- Create: `backend/src/modules/escolas/escolas.service.test.ts`

**Interfaces:**
- Consumes: `prisma` (Task 3), `Escola` Prisma model.
- Produces: `EscolaRepository` object with `list(page: number, pageSize: number): Promise<{ items: Escola[]; total: number }>`, `findById(id: string): Promise<Escola | null>`, `create(data: CreateEscolaInput): Promise<Escola>`, `update(id: string, data: UpdateEscolaInput): Promise<Escola>`, `softDelete(id: string): Promise<Escola>`. `EscolaService` wrapping the same signatures with validation, consumed by Task 8 (`escolas.routes.ts`).

- [ ] **Step 1: Create `backend/src/modules/escolas/escolas.types.ts`**

```typescript
export interface CreateEscolaInput {
  nome: string;
  cnpj?: string;
  endereco?: string;
  telefone?: string;
}

export type UpdateEscolaInput = Partial<CreateEscolaInput>;
```

- [ ] **Step 2: Create `backend/src/modules/escolas/escolas.repository.ts`**

```typescript
import { prisma } from "../../core/prisma.js";
import type { CreateEscolaInput, UpdateEscolaInput } from "./escolas.types.js";

export const escolaRepository = {
  async list(page: number, pageSize: number) {
    const [items, total] = await Promise.all([
      prisma.escola.findMany({
        where: { ativo: true },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { nome: "asc" }
      }),
      prisma.escola.count({ where: { ativo: true } })
    ]);
    return { items, total };
  },

  findById(id: string) {
    return prisma.escola.findUnique({ where: { id } });
  },

  create(data: CreateEscolaInput) {
    return prisma.escola.create({ data });
  },

  update(id: string, data: UpdateEscolaInput) {
    return prisma.escola.update({ where: { id }, data });
  },

  softDelete(id: string) {
    return prisma.escola.update({ where: { id }, data: { ativo: false } });
  }
};
```

- [ ] **Step 3: Write failing test for `escolaService`**

Create `backend/src/modules/escolas/escolas.service.test.ts`:

```typescript
import { describe, it, expect, beforeEach, afterAll } from "vitest";
import { prisma } from "../../core/prisma.js";
import { escolaService, EscolaNotFoundError } from "./escolas.service.js";

describe("escolaService", () => {
  beforeEach(async () => {
    await prisma.escola.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("creates and retrieves an escola", async () => {
    const created = await escolaService.create({ nome: "Escola Central" });
    const found = await escolaService.getById(created.id);
    expect(found.nome).toBe("Escola Central");
    expect(found.ativo).toBe(true);
  });

  it("throws EscolaNotFoundError for missing id", async () => {
    await expect(escolaService.getById("00000000-0000-0000-0000-000000000000")).rejects.toThrow(
      EscolaNotFoundError
    );
  });

  it("lists only active escolas after soft delete", async () => {
    const a = await escolaService.create({ nome: "Escola A" });
    await escolaService.create({ nome: "Escola B" });
    await escolaService.remove(a.id);

    const { items, total } = await escolaService.list(1, 10);
    expect(total).toBe(1);
    expect(items.map((e) => e.nome)).toEqual(["Escola B"]);
  });

  it("rejects creating an escola with an empty nome", async () => {
    await expect(escolaService.create({ nome: "" })).rejects.toThrow();
  });
});
```

- [ ] **Step 4: Run test to verify it fails**

Run: `pnpm --filter backend test escolas.service`
Expected: FAIL — `./escolas.service.js` not found.

- [ ] **Step 5: Create `backend/src/modules/escolas/escolas.service.ts`**

```typescript
import { escolaRepository } from "./escolas.repository.js";
import type { CreateEscolaInput, UpdateEscolaInput } from "./escolas.types.js";

export class EscolaNotFoundError extends Error {}
export class EscolaValidationError extends Error {}

function assertValidNome(nome: string | undefined) {
  if (nome !== undefined && nome.trim().length === 0) {
    throw new EscolaValidationError("nome must not be empty");
  }
}

export const escolaService = {
  list(page: number, pageSize: number) {
    return escolaRepository.list(page, pageSize);
  },

  async getById(id: string) {
    const escola = await escolaRepository.findById(id);
    if (!escola) {
      throw new EscolaNotFoundError(id);
    }
    return escola;
  },

  create(data: CreateEscolaInput) {
    assertValidNome(data.nome);
    return escolaRepository.create(data);
  },

  async update(id: string, data: UpdateEscolaInput) {
    assertValidNome(data.nome);
    await this.getById(id);
    return escolaRepository.update(id, data);
  },

  async remove(id: string) {
    await this.getById(id);
    return escolaRepository.softDelete(id);
  }
};
```

- [ ] **Step 6: Run test to verify it passes**

Run: `pnpm --filter backend test escolas.service`
Expected: PASS (all 4 tests)

- [ ] **Step 7: Commit**

```bash
git add backend/src/modules/escolas/escolas.types.ts backend/src/modules/escolas/escolas.repository.ts backend/src/modules/escolas/escolas.service.ts backend/src/modules/escolas/escolas.service.test.ts
git commit -m "feat(backend): add Escolas repository and service with soft delete"
```

---

### Task 8: Escolas routes (wired behind auth)

**Files:**
- Create: `backend/src/modules/escolas/escolas.routes.ts`
- Create: `backend/src/modules/escolas/escolas.routes.test.ts`
- Modify: `backend/src/app.ts`

**Interfaces:**
- Consumes: `escolaService` (Task 7), `requireAuth` (Task 5), `signAccessToken` (Task 4) for test login.
- Produces: `registerEscolasRoutes(app: FastifyInstance, config: Config): void` mounting `GET /escolas`, `GET /escolas/:id`, `POST /escolas`, `PUT /escolas/:id`, `DELETE /escolas/:id`, all behind `requireAuth`.

- [ ] **Step 1: Write failing test for Escolas routes**

Create `backend/src/modules/escolas/escolas.routes.test.ts`:

```typescript
import { describe, it, expect, beforeAll, beforeEach, afterAll } from "vitest";
import type { FastifyInstance } from "fastify";
import { buildApp } from "../../app.js";
import { prisma } from "../../core/prisma.js";
import { loadConfig } from "../../core/config.js";
import { signAccessToken } from "../../core/jwt.js";
import { hashPassword } from "../../core/password.js";

describe("escolas routes", () => {
  let app: FastifyInstance;
  let authCookie: string;

  beforeAll(async () => {
    app = await buildApp();
    const config = loadConfig();
    const user = await prisma.user.upsert({
      where: { email: "routes-test@example.com" },
      update: {},
      create: {
        email: "routes-test@example.com",
        passwordHash: await hashPassword("x"),
        name: "Tester"
      }
    });
    authCookie = `access_token=${signAccessToken(user.id, config.jwtAccessSecret)}`;
  });

  beforeEach(async () => {
    await prisma.escola.deleteMany();
  });

  afterAll(async () => {
    await app.close();
    await prisma.$disconnect();
  });

  it("rejects unauthenticated requests", async () => {
    const response = await app.inject({ method: "GET", url: "/escolas" });
    expect(response.statusCode).toBe(401);
  });

  it("creates then lists an escola", async () => {
    const createRes = await app.inject({
      method: "POST",
      url: "/escolas",
      headers: { cookie: authCookie },
      payload: { nome: "Escola Teste" }
    });
    expect(createRes.statusCode).toBe(201);

    const listRes = await app.inject({
      method: "GET",
      url: "/escolas",
      headers: { cookie: authCookie }
    });
    expect(listRes.statusCode).toBe(200);
    const body = listRes.json();
    expect(body.items).toHaveLength(1);
    expect(body.items[0].nome).toBe("Escola Teste");
  });

  it("soft-deletes an escola", async () => {
    const createRes = await app.inject({
      method: "POST",
      url: "/escolas",
      headers: { cookie: authCookie },
      payload: { nome: "Para Remover" }
    });
    const { id } = createRes.json();

    const deleteRes = await app.inject({
      method: "DELETE",
      url: `/escolas/${id}`,
      headers: { cookie: authCookie }
    });
    expect(deleteRes.statusCode).toBe(200);

    const listRes = await app.inject({
      method: "GET",
      url: "/escolas",
      headers: { cookie: authCookie }
    });
    expect(listRes.json().items).toHaveLength(0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm --filter backend test escolas.routes`
Expected: FAIL — `/escolas` returns 404 (not registered).

- [ ] **Step 3: Create `backend/src/modules/escolas/escolas.routes.ts`**

```typescript
import type { FastifyInstance } from "fastify";
import { escolaService, EscolaNotFoundError, EscolaValidationError } from "./escolas.service.js";
import { requireAuth } from "../../core/auth-hook.js";
import type { Config } from "../../core/config.js";
import type { CreateEscolaInput, UpdateEscolaInput } from "./escolas.types.js";

export function registerEscolasRoutes(app: FastifyInstance, config: Config) {
  const auth = { preHandler: requireAuth(config) };

  app.get<{ Querystring: { page?: string; pageSize?: string } }>(
    "/escolas",
    auth,
    async (request) => {
      const page = Number(request.query.page ?? 1);
      const pageSize = Number(request.query.pageSize ?? 20);
      return escolaService.list(page, pageSize);
    }
  );

  app.get<{ Params: { id: string } }>("/escolas/:id", auth, async (request, reply) => {
    try {
      return await escolaService.getById(request.params.id);
    } catch (err) {
      if (err instanceof EscolaNotFoundError) {
        return reply.code(404).send({ error: "Escola not found" });
      }
      throw err;
    }
  });

  app.post<{ Body: CreateEscolaInput }>("/escolas", auth, async (request, reply) => {
    try {
      const escola = await escolaService.create(request.body);
      return reply.code(201).send(escola);
    } catch (err) {
      if (err instanceof EscolaValidationError) {
        return reply.code(400).send({ error: err.message });
      }
      throw err;
    }
  });

  app.put<{ Params: { id: string }; Body: UpdateEscolaInput }>(
    "/escolas/:id",
    auth,
    async (request, reply) => {
      try {
        return await escolaService.update(request.params.id, request.body);
      } catch (err) {
        if (err instanceof EscolaNotFoundError) {
          return reply.code(404).send({ error: "Escola not found" });
        }
        if (err instanceof EscolaValidationError) {
          return reply.code(400).send({ error: err.message });
        }
        throw err;
      }
    }
  );

  app.delete<{ Params: { id: string } }>("/escolas/:id", auth, async (request, reply) => {
    try {
      return await escolaService.remove(request.params.id);
    } catch (err) {
      if (err instanceof EscolaNotFoundError) {
        return reply.code(404).send({ error: "Escola not found" });
      }
      throw err;
    }
  });
}
```

- [ ] **Step 4: Wire routes into `app.ts`**

Modify `backend/src/app.ts` — add import and registration:

```typescript
import { registerEscolasRoutes } from "./modules/escolas/escolas.routes.js";
```

Add after `registerAuthRoutes(app, config);`:

```typescript
  registerEscolasRoutes(app, config);
```

- [ ] **Step 5: Run test to verify it passes**

Run: `pnpm --filter backend test escolas.routes`
Expected: PASS (all 3 tests). Then `pnpm --filter backend test` — full backend suite green.

- [ ] **Step 6: Commit**

```bash
git add backend/src/modules/escolas/escolas.routes.ts backend/src/modules/escolas/escolas.routes.test.ts backend/src/app.ts
git commit -m "feat(backend): wire Escolas CRUD routes behind auth"
```

---

### Task 9: Frontend scaffold (Vite + React + core)

**Files:**
- Create: `frontend/package.json`
- Create: `frontend/tsconfig.json`
- Create: `frontend/vite.config.ts`
- Create: `frontend/index.html`
- Create: `frontend/.env.example`
- Create: `frontend/src/main.tsx`
- Create: `frontend/src/App.tsx`
- Create: `frontend/src/core/apiClient.ts`
- Create: `frontend/src/core/Layout.tsx`
- Create: `frontend/src/core/router.tsx`
- Test: `frontend/src/core/apiClient.test.ts`

**Interfaces:**
- Produces: `apiClient` object from `frontend/src/core/apiClient.ts` with `get<T>(path: string): Promise<T>`, `post<T>(path: string, body: unknown): Promise<T>`, `put<T>(path: string, body: unknown): Promise<T>`, `del<T>(path: string): Promise<T>` — all `fetch` wrappers using `credentials: "include"` and base URL from `import.meta.env.VITE_API_URL`. Consumed by Tasks 10 and 12.

- [ ] **Step 1: Create `frontend/package.json`**

```json
{
  "name": "frontend",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "test": "vitest run",
    "lint": "eslint src --ext .ts,.tsx"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.26.1"
  },
  "devDependencies": {
    "@testing-library/react": "^16.0.0",
    "@testing-library/jest-dom": "^6.4.8",
    "@types/react": "^18.3.3",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.1",
    "jsdom": "^24.1.1",
    "vite": "^5.4.1",
    "vitest": "^2.0.5"
  }
}
```

- [ ] **Step 2: Create `frontend/tsconfig.json`**

```json
{
  "extends": "../tsconfig.base.json",
  "compilerOptions": {
    "lib": ["ES2022", "DOM"],
    "jsx": "react-jsx",
    "noEmit": true
  },
  "include": ["src"]
}
```

- [ ] **Step 3: Create `frontend/vite.config.ts`**

```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true
  }
});
```

- [ ] **Step 4: Create `frontend/index.html`**

```html
<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <title>GerenciadorAlunos</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 5: Create `frontend/.env.example`**

```
VITE_API_URL=http://localhost:3000
```

Run: `cp frontend/.env.example frontend/.env`

- [ ] **Step 6: Write failing test for `apiClient`**

Create `frontend/src/core/apiClient.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";
import { apiClient } from "./apiClient.js";

describe("apiClient", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(JSON.stringify({ ok: true }), { status: 200 }))
    );
  });

  it("performs a GET with credentials included", async () => {
    const result = await apiClient.get<{ ok: boolean }>("/health");
    expect(result).toEqual({ ok: true });
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/health"),
      expect.objectContaining({ credentials: "include", method: "GET" })
    );
  });
});
```

- [ ] **Step 7: Run test to verify it fails**

Run: `pnpm --filter frontend test apiClient`
Expected: FAIL — `./apiClient.js` not found.

- [ ] **Step 8: Create `frontend/src/core/apiClient.ts`**

```typescript
const BASE_URL = import.meta.env.VITE_API_URL as string;

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    credentials: "include",
    headers: { "Content-Type": "application/json", ...options.headers }
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export const apiClient = {
  get: <T>(path: string) => request<T>(path, { method: "GET" }),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "POST", body: JSON.stringify(body) }),
  put: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "PUT", body: JSON.stringify(body) }),
  del: <T>(path: string) => request<T>(path, { method: "DELETE" })
};
```

- [ ] **Step 9: Run test to verify it passes**

Run: `pnpm --filter frontend test apiClient`
Expected: PASS

- [ ] **Step 10: Create `frontend/src/core/Layout.tsx`**

```tsx
import { Outlet, Link } from "react-router-dom";

export function Layout() {
  return (
    <div>
      <nav>
        <Link to="/escolas">Escolas</Link>
      </nav>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
```

- [ ] **Step 11: Create `frontend/src/core/router.tsx`**

```tsx
import { createBrowserRouter } from "react-router-dom";
import { Layout } from "./Layout.js";
import { LoginPage } from "../auth/LoginPage.js";
import { RouteGuard } from "../auth/RouteGuard.js";
import { EscolasPage } from "../modules/escolas/pages/EscolasPage.js";

export const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },
  {
    path: "/",
    element: (
      <RouteGuard>
        <Layout />
      </RouteGuard>
    ),
    children: [{ path: "escolas", element: <EscolasPage /> }]
  }
]);
```

- [ ] **Step 12: Create `frontend/src/App.tsx`**

```tsx
import { RouterProvider } from "react-router-dom";
import { router } from "./core/router.js";
import { AuthProvider } from "./auth/AuthContext.js";

export function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}
```

- [ ] **Step 13: Create `frontend/src/main.tsx`**

```tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./App.js";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

Note: `App.tsx` references `auth/AuthContext.js`, `auth/LoginPage.js`, `auth/RouteGuard.js`, and `modules/escolas/pages/EscolasPage.js`, which don't exist until Tasks 10–12. This task's own test (`apiClient.test.ts`) doesn't depend on them, so it passes independently — but `pnpm --filter frontend build`/full app run won't work until Task 12 is done. Skip the "run full app" manual check until Task 12.

- [ ] **Step 14: Install frontend dependencies**

Run: `pnpm install`
Expected: `frontend/node_modules` populated, lockfile updated.

- [ ] **Step 15: Commit**

```bash
git add frontend/package.json frontend/tsconfig.json frontend/vite.config.ts frontend/index.html frontend/.env.example frontend/src/core frontend/src/App.tsx frontend/src/main.tsx pnpm-lock.yaml
git commit -m "feat(frontend): scaffold Vite+React app shell, router, apiClient"
```

---

### Task 10: Frontend auth (AuthContext, LoginPage, RouteGuard)

**Files:**
- Create: `frontend/src/auth/auth.service.ts`
- Create: `frontend/src/auth/AuthContext.tsx`
- Create: `frontend/src/auth/AuthContext.test.tsx`
- Create: `frontend/src/auth/LoginPage.tsx`
- Create: `frontend/src/auth/RouteGuard.tsx`

**Interfaces:**
- Consumes: `apiClient` (Task 9).
- Produces: `AuthProvider` (React context provider, consumed by `App.tsx` from Task 9), `useAuth(): { user: { id: string } | null; login(email, password): Promise<void>; logout(): Promise<void> }` hook, `RouteGuard` component (redirects to `/login` when `user` is `null`), `LoginPage` component.

- [ ] **Step 1: Create `frontend/src/auth/auth.service.ts`**

```typescript
import { apiClient } from "../core/apiClient.js";

export interface LoginResponse {
  userId: string;
}

export const authService = {
  login: (email: string, password: string) =>
    apiClient.post<LoginResponse>("/auth/login", { email, password }),
  logout: () => apiClient.post<{ ok: boolean }>("/auth/logout", {})
};
```

- [ ] **Step 2: Write failing test for `AuthContext`**

Create `frontend/src/auth/AuthContext.test.tsx`:

```tsx
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { AuthProvider, useAuth } from "./AuthContext.js";

function Probe() {
  const { user, login } = useAuth();
  return (
    <div>
      <span>{user ? `logged-in:${user.id}` : "logged-out"}</span>
      <button onClick={() => login("a@b.com", "pw")}>login</button>
    </div>
  );
}

describe("AuthContext", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(JSON.stringify({ userId: "u1" }), { status: 200 }))
    );
  });

  it("starts logged out and updates after login()", async () => {
    render(
      <AuthProvider>
        <Probe />
      </AuthProvider>
    );

    expect(screen.getByText("logged-out")).toBeTruthy();
    fireEvent.click(screen.getByText("login"));

    await waitFor(() => expect(screen.getByText("logged-in:u1")).toBeTruthy());
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `pnpm --filter frontend test AuthContext`
Expected: FAIL — `./AuthContext.js` not found.

- [ ] **Step 4: Create `frontend/src/auth/AuthContext.tsx`**

```tsx
import { createContext, useContext, useState, ReactNode } from "react";
import { authService } from "./auth.service.js";

interface AuthUser {
  id: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);

  async function login(email: string, password: string) {
    const result = await authService.login(email, password);
    setUser({ id: result.userId });
  }

  async function logout() {
    await authService.logout();
    setUser(null);
  }

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `pnpm --filter frontend test AuthContext`
Expected: PASS

- [ ] **Step 6: Create `frontend/src/auth/LoginPage.tsx`**

```tsx
import { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext.js";

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await login(email, password);
      navigate("/escolas");
    } catch {
      setError("Credenciais inválidas");
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h1>Login</h1>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Senha"
      />
      <button type="submit">Entrar</button>
      {error && <p role="alert">{error}</p>}
    </form>
  );
}
```

- [ ] **Step 7: Create `frontend/src/auth/RouteGuard.tsx`**

```tsx
import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext.js";

export function RouteGuard({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}
```

- [ ] **Step 8: Commit**

```bash
git add frontend/src/auth
git commit -m "feat(frontend): add AuthContext, LoginPage, RouteGuard"
```

---

### Task 11: Shared frontend components (Table, Modal, Button)

**Files:**
- Create: `frontend/src/shared/components/Button.tsx`
- Create: `frontend/src/shared/components/Modal.tsx`
- Create: `frontend/src/shared/components/Table.tsx`
- Create: `frontend/src/shared/components/Table.test.tsx`

**Interfaces:**
- Produces: `Button` (standard `<button>` wrapper, props: standard button attrs). `Modal({ open, onClose, children }: { open: boolean; onClose: () => void; children: ReactNode })`. `Table<T>({ columns, rows }: { columns: { key: keyof T; header: string }[]; rows: T[] })`. All consumed by Task 12's Escolas components.

- [ ] **Step 1: Create `frontend/src/shared/components/Button.tsx`**

```tsx
import { ButtonHTMLAttributes } from "react";

export function Button(props: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button {...props} />;
}
```

- [ ] **Step 2: Create `frontend/src/shared/components/Modal.tsx`**

```tsx
import { ReactNode } from "react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}

export function Modal({ open, onClose, children }: ModalProps) {
  if (!open) {
    return null;
  }

  return (
    <div role="dialog" aria-modal="true">
      <button aria-label="Fechar" onClick={onClose}>
        ×
      </button>
      {children}
    </div>
  );
}
```

- [ ] **Step 3: Write failing test for `Table`**

Create `frontend/src/shared/components/Table.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Table } from "./Table.js";

interface Row {
  id: string;
  nome: string;
}

describe("Table", () => {
  it("renders headers and row values", () => {
    const rows: Row[] = [{ id: "1", nome: "Escola A" }];
    render(
      <Table<Row> columns={[{ key: "nome", header: "Nome" }]} rows={rows} rowKey={(r) => r.id} />
    );

    expect(screen.getByText("Nome")).toBeTruthy();
    expect(screen.getByText("Escola A")).toBeTruthy();
  });
});
```

- [ ] **Step 4: Run test to verify it fails**

Run: `pnpm --filter frontend test Table`
Expected: FAIL — `./Table.js` not found.

- [ ] **Step 5: Create `frontend/src/shared/components/Table.tsx`**

```tsx
interface Column<T> {
  key: keyof T;
  header: string;
}

interface TableProps<T> {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
}

export function Table<T>({ columns, rows, rowKey }: TableProps<T>) {
  return (
    <table>
      <thead>
        <tr>
          {columns.map((col) => (
            <th key={String(col.key)}>{col.header}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={rowKey(row)}>
            {columns.map((col) => (
              <td key={String(col.key)}>{String(row[col.key])}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

- [ ] **Step 6: Run test to verify it passes**

Run: `pnpm --filter frontend test Table`
Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add frontend/src/shared
git commit -m "feat(frontend): add shared Button, Modal, Table components"
```

---

### Task 12: Frontend Escolas module (service, hook, components, page)

**Files:**
- Create: `frontend/src/modules/escolas/types.ts`
- Create: `frontend/src/modules/escolas/services/escolas.service.ts`
- Create: `frontend/src/modules/escolas/hooks/useEscolas.ts`
- Create: `frontend/src/modules/escolas/components/EscolaForm.tsx`
- Create: `frontend/src/modules/escolas/components/EscolaList.tsx`
- Create: `frontend/src/modules/escolas/components/EscolaList.test.tsx`
- Create: `frontend/src/modules/escolas/pages/EscolasPage.tsx`

**Interfaces:**
- Consumes: `apiClient` (Task 9), `Table`/`Modal`/`Button` (Task 11), `RouteGuard`/`AuthProvider` (Task 10) via `router.tsx`/`App.tsx` (Task 9, already wired).
- Produces: `EscolasPage`, the component referenced by `frontend/src/core/router.tsx` (Task 9), completing the app dependency graph so the frontend builds and runs end-to-end. Per the design spec, this is a table + create/edit modal built from the shared `Table`/`Modal` components (Task 11) — both `create` and `update` are wired, matching the backend's `POST`/`PUT /escolas` (Task 8).

- [ ] **Step 1: Create `frontend/src/modules/escolas/types.ts`**

```typescript
export interface Escola {
  id: string;
  nome: string;
  cnpj: string | null;
  endereco: string | null;
  telefone: string | null;
  ativo: boolean;
}

export interface CreateEscolaInput {
  nome: string;
  cnpj?: string;
  endereco?: string;
  telefone?: string;
}

export type UpdateEscolaInput = Partial<CreateEscolaInput>;
```

- [ ] **Step 2: Create `frontend/src/modules/escolas/services/escolas.service.ts`**

```typescript
import { apiClient } from "../../../core/apiClient.js";
import type { Escola, CreateEscolaInput, UpdateEscolaInput } from "../types.js";

interface EscolaListResponse {
  items: Escola[];
  total: number;
}

export const escolasService = {
  list: () => apiClient.get<EscolaListResponse>("/escolas"),
  create: (data: CreateEscolaInput) => apiClient.post<Escola>("/escolas", data),
  update: (id: string, data: UpdateEscolaInput) => apiClient.put<Escola>(`/escolas/${id}`, data),
  remove: (id: string) => apiClient.del<Escola>(`/escolas/${id}`)
};
```

- [ ] **Step 3: Create `frontend/src/modules/escolas/hooks/useEscolas.ts`**

```typescript
import { useCallback, useEffect, useState } from "react";
import { escolasService } from "../services/escolas.service.js";
import type { Escola, CreateEscolaInput, UpdateEscolaInput } from "../types.js";

export function useEscolas() {
  const [escolas, setEscolas] = useState<Escola[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const { items } = await escolasService.list();
    setEscolas(items);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function create(data: CreateEscolaInput) {
    await escolasService.create(data);
    await refresh();
  }

  async function update(id: string, data: UpdateEscolaInput) {
    await escolasService.update(id, data);
    await refresh();
  }

  async function remove(id: string) {
    await escolasService.remove(id);
    await refresh();
  }

  return { escolas, loading, create, update, remove };
}
```

- [ ] **Step 4: Create `frontend/src/modules/escolas/components/EscolaForm.tsx`**

```tsx
import { useState, FormEvent } from "react";
import { Button } from "../../../shared/components/Button.js";
import type { CreateEscolaInput } from "../types.js";

interface EscolaFormProps {
  initial?: CreateEscolaInput;
  submitLabel: string;
  onSubmit: (data: CreateEscolaInput) => Promise<void>;
}

export function EscolaForm({ initial, submitLabel, onSubmit }: EscolaFormProps) {
  const [nome, setNome] = useState(initial?.nome ?? "");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    await onSubmit({ nome });
    if (!initial) {
      setNome("");
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        placeholder="Nome da escola"
      />
      <Button type="submit">{submitLabel}</Button>
    </form>
  );
}
```

- [ ] **Step 5: Write failing test for `EscolaList`**

Create `frontend/src/modules/escolas/components/EscolaList.test.tsx`:

```tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { EscolaList } from "./EscolaList.js";
import type { Escola } from "../types.js";

describe("EscolaList", () => {
  it("renders escolas and calls onEdit/onRemove when clicked", () => {
    const escolas: Escola[] = [
      { id: "1", nome: "Escola A", cnpj: null, endereco: null, telefone: null, ativo: true }
    ];
    const onEdit = vi.fn();
    const onRemove = vi.fn();

    render(<EscolaList escolas={escolas} onEdit={onEdit} onRemove={onRemove} />);

    expect(screen.getByText("Escola A")).toBeTruthy();

    fireEvent.click(screen.getByText("Editar"));
    expect(onEdit).toHaveBeenCalledWith(escolas[0]);

    fireEvent.click(screen.getByText("Remover"));
    expect(onRemove).toHaveBeenCalledWith("1");
  });
});
```

- [ ] **Step 6: Run test to verify it fails**

Run: `pnpm --filter frontend test EscolaList`
Expected: FAIL, EscolaList.js not found.

- [ ] **Step 7: Create `frontend/src/modules/escolas/components/EscolaList.tsx`**

```tsx
import { Table } from "../../../shared/components/Table.js";
import { Button } from "../../../shared/components/Button.js";
import type { Escola } from "../types.js";

interface EscolaListProps {
  escolas: Escola[];
  onEdit: (escola: Escola) => void;
  onRemove: (id: string) => void;
}

export function EscolaList({ escolas, onEdit, onRemove }: EscolaListProps) {
  return (
    <div>
      <Table<Escola>
        columns={[{ key: "nome", header: "Nome" }]}
        rows={escolas}
        rowKey={(e) => e.id}
      />
      {escolas.map((e) => (
        <div key={e.id}>
          <Button onClick={() => onEdit(e)}>Editar</Button>
          <Button onClick={() => onRemove(e.id)}>Remover</Button>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 8: Run test to verify it passes**

Run: `pnpm --filter frontend test EscolaList`
Expected: PASS

- [ ] **Step 9: Create `frontend/src/modules/escolas/pages/EscolasPage.tsx`**

```tsx
import { useState } from "react";
import { useEscolas } from "../hooks/useEscolas.js";
import { EscolaForm } from "../components/EscolaForm.js";
import { EscolaList } from "../components/EscolaList.js";
import { Modal } from "../../../shared/components/Modal.js";
import { Button } from "../../../shared/components/Button.js";
import type { Escola, CreateEscolaInput } from "../types.js";

export function EscolasPage() {
  const { escolas, loading, create, update, remove } = useEscolas();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Escola | null>(null);

  if (loading) {
    return <p>Carregando...</p>;
  }

  function openCreate() {
    setEditing(null);
    setModalOpen(true);
  }

  function openEdit(escola: Escola) {
    setEditing(escola);
    setModalOpen(true);
  }

  async function handleSubmit(data: CreateEscolaInput) {
    if (editing) {
      await update(editing.id, data);
    } else {
      await create(data);
    }
    setModalOpen(false);
  }

  return (
    <div>
      <h1>Escolas</h1>
      <Button onClick={openCreate}>Nova Escola</Button>
      <EscolaList escolas={escolas} onEdit={openEdit} onRemove={remove} />
      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <EscolaForm
          initial={editing ?? undefined}
          submitLabel={editing ? "Salvar" : "Adicionar"}
          onSubmit={handleSubmit}
        />
      </Modal>
    </div>
  );
}
```

- [ ] **Step 10: Run full frontend test suite**

Run: `pnpm --filter frontend test`
Expected: all tests PASS (apiClient, AuthContext, Table, EscolaList).

- [ ] **Step 11: Verify frontend builds**

Run: `pnpm --filter frontend build`
Expected: completes with no TypeScript errors, emits `frontend/dist`.

- [ ] **Step 12: Commit**

```bash
git add frontend/src/modules
git commit -m "feat(frontend): add Escolas module with create/edit modal, list, remove"
```

---

### Task 13: End-to-end verification

**Files:** none created, this task only runs and verifies existing pieces together.

**Interfaces:** none produced, terminal task of the plan.

- [ ] **Step 1: Start Postgres**

Run: `docker compose up -d postgres`
Expected: container healthy.

- [ ] **Step 2: Apply migrations and seed admin**

Run: `pnpm --filter backend exec prisma migrate deploy && pnpm --filter backend exec prisma db seed`
Expected: migrations applied, admin user seeded.

- [ ] **Step 3: Run full backend test suite**

Run: `pnpm --filter backend test`
Expected: all suites PASS (app, jwt, password, auth, escolas.service, escolas.routes).

- [ ] **Step 4: Run full frontend test suite**

Run: `pnpm --filter frontend test`
Expected: all suites PASS.

- [ ] **Step 5: Start both dev servers**

Run: `pnpm dev` (background)
Expected: backend on port 3000, frontend on port 5173 (Vite default), no crash in either log.

- [ ] **Step 6: Manual browser walkthrough**

Open `http://localhost:5173` in a browser.
Expected: redirected to `/login`. Log in with `ADMIN_SEED_EMAIL`/`ADMIN_SEED_PASSWORD` from `backend/.env`. After login, redirected to `/escolas`. Click "Nova Escola", the modal opens; submit a name, it appears in the list. Click "Editar" on that row, the modal opens pre-filled; change the name and save, the list reflects the change. Click "Remover", it disappears from the list (soft-deleted).

- [ ] **Step 7: Stop dev servers**

Stop the background `pnpm dev` process.

- [ ] **Step 8: Final commit check**

Run: `git status`
Expected: clean working tree (all prior tasks already committed). If anything is untracked or dirty, review and commit or discard as appropriate, do not leave uncommitted state.

---

## Post-Plan

Foundation phase is done once Task 13 passes. Next: brainstorm the Cadastros spec (Turmas, Materias, Professores, Alunos, Pais/Responsaveis, Calendario Letivo, Periodo, plus planilha import), repeating this same routes -> service -> repository pattern for each entity.
