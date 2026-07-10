# Foundation — Design Spec

**Date**: 2026-07-09
**Phase**: 1 of 6 (Foundation) — see "Roadmap" below for full system context

## Context

GerenciadorAlunos is a system to manage student attendance (faltas) and
performance (desempenho), with dashboards/reports, configurable absence
indicators, and bulk WhatsApp notifications. This spec covers only the
**Foundation** phase: the architectural skeleton, tooling, auth, and one
real end-to-end module (Escolas) that proves the pattern every later module
will repeat.

## Roadmap (for context — not part of this spec)

1. **Foundation** (this spec) — scaffold, arch skeleton, auth, Escolas CRUD
2. **Cadastros** — Turmas, Matérias, Professores, Alunos, Pais/Responsáveis,
   Calendário Letivo, Período; manual CRUD + planilha import
3. **Faltas** — attendance records + configurable indicator engine
   (1 dia, 2/5 dias consecutivos, 3 dias não consecutivos, etc.)
4. **Desempenho** — grades/performance tied to aluno/turma/matéria
5. **Dashboard/Relatórios** — charts by turma, aluno, matéria
6. **WhatsApp** — bulk send triggered by indicators, message templates,
   "responsável por comunicar" assignment

Each phase gets its own spec + plan when it starts.

## Stack

- **Backend**: Fastify + TypeScript + Prisma ORM
- **Frontend**: React + Vite + TypeScript
- **Database**: PostgreSQL
- **Monorepo**: pnpm workspaces
- **Testing**: Vitest (both packages), backend tests run against a real
  Postgres test DB (no mocking the database)
- **Lint/format**: ESLint + Prettier, shared root config
- **Auth**: JWT access token (short-lived) + refresh token, both httpOnly
  cookies. No self-registration; first admin seeded via Prisma seed script.
  No roles/permissions — any logged-in user has full access to all modules
  (per requirements, permissions are out of scope for the whole system, not
  just this phase).

## Repo layout

```
GerenciadorAlunos/
├── backend/
├── frontend/
├── docs/
├── pnpm-workspace.yaml
└── CLAUDE.md
```

## Backend architecture

Layered modular monolith: `UI (routes) → Service → Repository → Database`.
**Core never depends on modules** — this is a hard rule, checked in review,
not just convention.

```
backend/src/
├── core/                  # config, logger, error types, Fastify plugin
│                          # setup, auth preHandler hook — no imports from
│                          # modules/, ever
├── shared/                # shared services/utils/types across modules
├── modules/
│   └── escolas/
│       ├── escolas.routes.ts       # thin, calls service only
│       ├── escolas.service.ts      # business logic, validation
│       ├── escolas.repository.ts   # Prisma queries only
│       ├── escolas.types.ts        # DTOs, request/response schemas
│       └── escolas.test.ts
├── auth/                  # login, JWT issue/verify — its own module
├── prisma/
│   └── schema.prisma
└── app.ts
```

Rule for every module (this and future ones): routes never touch Prisma
directly, services never touch Fastify request/reply objects, repositories
contain no business rules.

## Frontend architecture

Mirrors backend module boundaries.

```
frontend/src/
├── core/                  # router, layout, error boundary, API client base
├── shared/
│   ├── components/        # generic UI (Button, Table, Modal...)
│   ├── hooks/
│   ├── services/
│   ├── utils/
│   └── types/
├── modules/
│   └── escolas/
│       ├── components/    # EscolaForm, EscolaList
│       ├── hooks/         # useEscolas
│       ├── services/      # escolas.service.ts
│       ├── types.ts
│       └── pages/         # EscolasPage
├── auth/                  # login page, AuthContext, token handling
└── App.tsx
```

Same rule: `core` never imports from `modules/`.

## Auth flow

- `User`: id, email, passwordHash, name, createdAt.
- `POST /auth/login` — verify bcrypt hash, issue access + refresh tokens as
  httpOnly cookies.
- `POST /auth/refresh` — rotates access token from refresh cookie.
- `POST /auth/logout` — clears cookies.
- Fastify `preHandler` hook in `core/` verifies JWT, attaches `request.user`.
- First admin user created via `pnpm --filter backend prisma db seed`,
  reading credentials from env vars.
- Frontend `auth/` module: `AuthContext` holds current user + login/logout;
  route guard redirects unauthenticated users to `/login`.

## Escolas module (pattern proof)

```prisma
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

Endpoints (all behind auth):
- `GET /escolas` — paginated list
- `GET /escolas/:id`
- `POST /escolas`
- `PUT /escolas/:id`
- `DELETE /escolas/:id` — soft delete (`ativo=false`); future modules FK to
  Escola, so hard delete is never used here.

Frontend: `EscolasPage` — table list + create/edit modal, built from shared
`Table`/`Modal` components.

## Tooling

- TypeScript strict mode; per-package `tsconfig.json` extending a root base.
- `docker-compose.yml` with a Postgres service for local dev + tests.
- `.env.example` committed per package; real `.env` gitignored.
- Root scripts (pnpm workspace filters):
  - `pnpm dev` — backend + frontend concurrently
  - `pnpm build` — both packages
  - `pnpm test` — both test suites
  - `pnpm lint` — both packages
  - `pnpm --filter backend prisma migrate dev`
  - `pnpm --filter backend prisma db seed`
- No CI configured in this phase.

## Out of scope for this phase

- Any module beyond Escolas (Turmas, Alunos, Matérias, Professores, Pais,
  Calendário, Período) — phase 2.
- Planilha import — phase 2.
- Faltas, indicadores, desempenho, dashboards, WhatsApp — phases 3–6.
- Roles/permissions — not planned for the system at all per requirements.
- CI/CD pipeline.
