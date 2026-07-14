# Situação do Aluno Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an administrable "Situação do Aluno" catalog (seeded with Ativo, Baixa Transferência, Transferido, Remanejamento), track the current situação on each Aluno, and keep a full history of every change with the date it happened.

**Architecture:** Two new Prisma models — `SituacaoAluno` (a cadastro, same shape/CRUD as `Periodo`/`Materia`) and `AlunoSituacaoHistorico` (append-only log of changes). `Aluno` gets a denormalized `situacaoAtualId` FK (same pattern as `Aluno.turmaId`) kept in sync with the latest historico row. Situação changes go through a dedicated sub-resource endpoint (`/alunos/:id/situacoes`), never through the generic `PUT /alunos/:id`, so the history can never be bypassed.

**Tech Stack:** Fastify + Prisma + PostgreSQL (backend), React + react-router + Tailwind (frontend), Vitest for both.

## Global Constraints

- Situação names, seeded verbatim: "Ativo", "Baixa Transferência", "Transferido", "Remanejamento".
- `Aluno.ativo` (soft-delete of the record) and `Aluno.situacaoAtualId` (academic status) are independent — never conflate them.
- `CreateAlunoInput`/`UpdateAlunoInput` never accept a situação field — situação is only set by the system (on create, defaulting to "Ativo") or via the dedicated change endpoint.
- Every situação change is confirmed via `useConfirm` before the API call, matching the app-wide convention from commit `3abc9fd`.
- Follow existing module conventions exactly: `.types.ts` / `.repository.ts` / `.service.ts` / `.routes.ts` + matching test files, one Fastify route registration per module in `app.ts`.

---

### Task 1: Prisma schema, migration, and existing-test fallout

**Files:**
- Modify: `backend/prisma/schema.prisma`
- Create: `backend/prisma/migrations/20260713120000_add_situacao_aluno/migration.sql`
- Create: `backend/prisma/backfill-situacao-historico.ts`
- Modify: `backend/src/modules/faltas/faltas.routes.test.ts:50-52`
- Modify: `backend/src/modules/notas/notas.routes.test.ts:46`
- Modify: `backend/src/modules/mensagens/mensagens.routes.test.ts:52-57`
- Modify: `backend/src/modules/aluno-responsaveis/aluno-responsaveis.routes.test.ts:49-51`

**Interfaces:**
- Produces: `SituacaoAluno` Prisma model (`id`, `nome` unique, `ativo`, `createdAt`, `updatedAt`), `AlunoSituacaoHistorico` Prisma model (`id`, `alunoId`, `situacaoId`, `dataMudanca` (Date-only), `observacao?`, `createdAt`), `Aluno.situacaoAtualId` (required String FK) + `Aluno.situacaoAtual` relation + `Aluno.situacoesHistorico` relation. Seeded rows with fixed ids: Ativo=`00000000-0000-0000-0000-000000000001`, Baixa Transferência=`...0002`, Transferido=`...0003`, Remanejamento=`...0004`.
- Consumes: nothing (first task).

This task intentionally leaves `backend/src/modules/alunos/alunos.service.test.ts` and `alunos.routes.test.ts` **failing** — `alunoRepository.create` doesn't supply `situacaoAtualId` yet. That's fixed in Task 4. Every other module's tests must stay green after this task.

- [ ] **Step 1: Edit `schema.prisma`**

Add a new model after `Periodo` (or anywhere top-level) and modify `Aluno`:

```prisma
model SituacaoAluno {
  id        String                   @id @default(uuid())
  nome      String                   @unique
  ativo     Boolean                  @default(true)
  createdAt DateTime                 @default(now())
  updatedAt DateTime                 @updatedAt
  alunos    Aluno[]
  historico AlunoSituacaoHistorico[]
}
```

Modify `model Aluno` (add these fields, keep everything else):

```prisma
model Aluno {
  id                 String                   @id @default(uuid())
  nome               String
  dataNascimento     DateTime?
  turmaId            String
  turma              Turma                    @relation(fields: [turmaId], references: [id])
  situacaoAtualId    String
  situacaoAtual      SituacaoAluno            @relation(fields: [situacaoAtualId], references: [id])
  ativo              Boolean                  @default(true)
  createdAt          DateTime                 @default(now())
  updatedAt          DateTime                 @updatedAt
  responsaveis       AlunoResponsavel[]
  faltas             Falta[]
  notas              Nota[]
  envios             EnvioMensagem[]
  situacoesHistorico AlunoSituacaoHistorico[]
}
```

Add a new model near the bottom (after `EnvioMensagem`):

```prisma
model AlunoSituacaoHistorico {
  id          String        @id @default(uuid())
  alunoId     String
  aluno       Aluno         @relation(fields: [alunoId], references: [id])
  situacaoId  String
  situacao    SituacaoAluno @relation(fields: [situacaoId], references: [id])
  dataMudanca DateTime      @db.Date
  observacao  String?
  createdAt   DateTime      @default(now())
}
```

- [ ] **Step 2: Hand-author the migration**

Prisma's diff engine would stop to ask how to backfill the new required column interactively, which we can't answer non-interactively. Write the migration file by hand instead — create the folder and file directly (matching the exact SQL Prisma itself would emit for this schema, plus the extra seed/backfill statements):

`backend/prisma/migrations/20260713120000_add_situacao_aluno/migration.sql`:

```sql
-- CreateTable
CREATE TABLE "SituacaoAluno" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SituacaoAluno_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SituacaoAluno_nome_key" ON "SituacaoAluno"("nome");

-- Seed default situações
INSERT INTO "SituacaoAluno" ("id", "nome", "ativo", "createdAt", "updatedAt") VALUES
    ('00000000-0000-0000-0000-000000000001', 'Ativo', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('00000000-0000-0000-0000-000000000002', 'Baixa Transferência', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('00000000-0000-0000-0000-000000000003', 'Transferido', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('00000000-0000-0000-0000-000000000004', 'Remanejamento', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- AlterTable: add nullable first so existing rows can be backfilled below
ALTER TABLE "Aluno" ADD COLUMN "situacaoAtualId" TEXT;

-- Backfill every pre-existing aluno to "Ativo"
UPDATE "Aluno" SET "situacaoAtualId" = '00000000-0000-0000-0000-000000000001' WHERE "situacaoAtualId" IS NULL;

-- Now it's safe to make it required
ALTER TABLE "Aluno" ALTER COLUMN "situacaoAtualId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Aluno" ADD CONSTRAINT "Aluno_situacaoAtualId_fkey" FOREIGN KEY ("situacaoAtualId") REFERENCES "SituacaoAluno"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "AlunoSituacaoHistorico" (
    "id" TEXT NOT NULL,
    "alunoId" TEXT NOT NULL,
    "situacaoId" TEXT NOT NULL,
    "dataMudanca" DATE NOT NULL,
    "observacao" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AlunoSituacaoHistorico_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "AlunoSituacaoHistorico" ADD CONSTRAINT "AlunoSituacaoHistorico_alunoId_fkey" FOREIGN KEY ("alunoId") REFERENCES "Aluno"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AlunoSituacaoHistorico" ADD CONSTRAINT "AlunoSituacaoHistorico_situacaoId_fkey" FOREIGN KEY ("situacaoId") REFERENCES "SituacaoAluno"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
```

- [ ] **Step 3: Apply the migration to dev and test databases, then regenerate the client**

Run (from `backend/`):

```bash
npx prisma migrate deploy
npx prisma generate
DATABASE_URL="postgresql://postgres:aoan1147@192.168.3.28:5432/gerenciador_alunos_test" npx prisma migrate deploy
```

Expected: both commands print `1 migration found... Applied`. `prisma generate` regenerates `@prisma/client` types (adds `SituacaoAluno`, `AlunoSituacaoHistorico`, `aluno.situacaoAtual`, etc.) so TypeScript picks them up.

- [ ] **Step 4: Write and run the historico backfill script**

`backend/prisma/backfill-situacao-historico.ts`:

```ts
import { prisma } from "../src/core/prisma.js";

async function main() {
  const alunos = await prisma.aluno.findMany({
    where: { situacoesHistorico: { none: {} } }
  });

  for (const aluno of alunos) {
    await prisma.alunoSituacaoHistorico.create({
      data: {
        alunoId: aluno.id,
        situacaoId: aluno.situacaoAtualId,
        dataMudanca: aluno.createdAt
      }
    });
  }

  console.log(`Backfilled histórico de situação para ${alunos.length} aluno(s).`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
```

Run against both databases:

```bash
npx tsx prisma/backfill-situacao-historico.ts
DATABASE_URL="postgresql://postgres:aoan1147@192.168.3.28:5432/gerenciador_alunos_test" npx tsx prisma/backfill-situacao-historico.ts
```

Expected: `Backfilled histórico de situação para N aluno(s).` (N is however many alunos already existed; 0 is fine on a fresh DB).

- [ ] **Step 5: Fix the four test files that create Aluno rows directly via Prisma**

These bypass `alunoService`, so they now violate the new NOT NULL FK. In each, look up the seeded "Ativo" situação and pass its id.

`backend/src/modules/faltas/faltas.routes.test.ts` — replace:

```ts
    const aluno = await prisma.aluno.create({
      data: { nome: "Aluno faltas-test", turmaId: turma.id }
    });
```

with:

```ts
    const situacaoAtiva = await prisma.situacaoAluno.findUniqueOrThrow({ where: { nome: "Ativo" } });
    const aluno = await prisma.aluno.create({
      data: { nome: "Aluno faltas-test", turmaId: turma.id, situacaoAtualId: situacaoAtiva.id }
    });
```

`backend/src/modules/notas/notas.routes.test.ts` — replace:

```ts
    const aluno = await prisma.aluno.create({ data: { nome: "Aluno notas-test", turmaId: turma.id } });
```

with:

```ts
    const situacaoAtiva = await prisma.situacaoAluno.findUniqueOrThrow({ where: { nome: "Ativo" } });
    const aluno = await prisma.aluno.create({
      data: { nome: "Aluno notas-test", turmaId: turma.id, situacaoAtualId: situacaoAtiva.id }
    });
```

`backend/src/modules/mensagens/mensagens.routes.test.ts` — replace:

```ts
    const alunoCom = await prisma.aluno.create({
      data: { nome: "Aluno Com mensagens-test", turmaId: turma.id }
    });
    const alunoSem = await prisma.aluno.create({
      data: { nome: "Aluno Sem mensagens-test", turmaId: turma.id }
    });
```

with:

```ts
    const situacaoAtiva = await prisma.situacaoAluno.findUniqueOrThrow({ where: { nome: "Ativo" } });
    const alunoCom = await prisma.aluno.create({
      data: { nome: "Aluno Com mensagens-test", turmaId: turma.id, situacaoAtualId: situacaoAtiva.id }
    });
    const alunoSem = await prisma.aluno.create({
      data: { nome: "Aluno Sem mensagens-test", turmaId: turma.id, situacaoAtualId: situacaoAtiva.id }
    });
```

`backend/src/modules/aluno-responsaveis/aluno-responsaveis.routes.test.ts` — replace:

```ts
    const aluno = await prisma.aluno.create({
      data: { nome: "Aluno aluno-resp-test", turmaId: turma.id }
    });
```

with:

```ts
    const situacaoAtiva = await prisma.situacaoAluno.findUniqueOrThrow({ where: { nome: "Ativo" } });
    const aluno = await prisma.aluno.create({
      data: { nome: "Aluno aluno-resp-test", turmaId: turma.id, situacaoAtualId: situacaoAtiva.id }
    });
```

- [ ] **Step 6: Run the full backend test suite**

Run: `cd backend && npx vitest run`

Expected: every suite passes **except** `alunos/alunos.service.test.ts` and `alunos/alunos.routes.test.ts`, which fail with a Prisma "Argument `situacaoAtualId` is missing" error. That's the documented, expected gap closed in Task 4.

- [ ] **Step 7: Commit**

```bash
git add backend/prisma/schema.prisma backend/prisma/migrations/20260713120000_add_situacao_aluno backend/prisma/backfill-situacao-historico.ts backend/src/modules/faltas/faltas.routes.test.ts backend/src/modules/notas/notas.routes.test.ts backend/src/modules/mensagens/mensagens.routes.test.ts backend/src/modules/aluno-responsaveis/aluno-responsaveis.routes.test.ts
git commit -m "feat(db): add SituacaoAluno catalog and AlunoSituacaoHistorico"
```

---

### Task 2: `situacoes-aluno` cadastro module (backend)

**Files:**
- Create: `backend/src/modules/situacoes-aluno/situacoes-aluno.types.ts`
- Create: `backend/src/modules/situacoes-aluno/situacoes-aluno.repository.ts`
- Create: `backend/src/modules/situacoes-aluno/situacoes-aluno.service.ts`
- Create: `backend/src/modules/situacoes-aluno/situacoes-aluno.service.test.ts`
- Create: `backend/src/modules/situacoes-aluno/situacoes-aluno.routes.ts`
- Create: `backend/src/modules/situacoes-aluno/situacoes-aluno.routes.test.ts`
- Modify: `backend/src/app.ts`

**Interfaces:**
- Consumes: `prisma` from `../../core/prisma.js`, `requireAuth` from `../../core/auth-hook.js` (both exist already).
- Produces: `situacaoAlunoRepository` (with `list`, `findById`, `findByNome`, `create`, `update`, `softDelete`), `situacaoAlunoService`, `SituacaoAlunoNotFoundError`, `SituacaoAlunoValidationError`, `registerSituacoesAlunoRoutes(app, config)`. Task 3 and Task 4 depend on `situacaoAlunoRepository.findByNome` and `situacaoAlunoService.getById`.

- [ ] **Step 1: Types**

`backend/src/modules/situacoes-aluno/situacoes-aluno.types.ts`:

```ts
export interface CreateSituacaoAlunoInput {
  nome: string;
}

export type UpdateSituacaoAlunoInput = Partial<CreateSituacaoAlunoInput>;
```

- [ ] **Step 2: Repository**

`backend/src/modules/situacoes-aluno/situacoes-aluno.repository.ts`:

```ts
import { prisma } from "../../core/prisma.js";
import type { CreateSituacaoAlunoInput, UpdateSituacaoAlunoInput } from "./situacoes-aluno.types.js";

export const situacaoAlunoRepository = {
  async list(page: number, pageSize: number) {
    const [items, total] = await Promise.all([
      prisma.situacaoAluno.findMany({
        where: { ativo: true },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { nome: "asc" }
      }),
      prisma.situacaoAluno.count({ where: { ativo: true } })
    ]);
    return { items, total };
  },

  findById(id: string) {
    return prisma.situacaoAluno.findUnique({ where: { id } });
  },

  findByNome(nome: string) {
    return prisma.situacaoAluno.findUnique({ where: { nome } });
  },

  create(data: CreateSituacaoAlunoInput) {
    return prisma.situacaoAluno.create({ data });
  },

  update(id: string, data: UpdateSituacaoAlunoInput) {
    return prisma.situacaoAluno.update({ where: { id }, data });
  },

  softDelete(id: string) {
    return prisma.situacaoAluno.update({ where: { id }, data: { ativo: false } });
  }
};
```

- [ ] **Step 3: Write the failing service test**

`backend/src/modules/situacoes-aluno/situacoes-aluno.service.test.ts`:

```ts
import { describe, it, expect, beforeEach, afterAll } from "vitest";
import { prisma } from "../../core/prisma.js";
import { situacaoAlunoService, SituacaoAlunoNotFoundError } from "./situacoes-aluno.service.js";

describe("situacaoAlunoService", () => {
  beforeEach(async () => {
    await prisma.situacaoAluno.deleteMany({ where: { nome: { contains: "situacoes-test" } } });
  });

  afterAll(async () => {
    await prisma.situacaoAluno.deleteMany({ where: { nome: { contains: "situacoes-test" } } });
    await prisma.$disconnect();
  });

  it("creates and retrieves a situacao", async () => {
    const created = await situacaoAlunoService.create({ nome: "Custom situacoes-test" });
    const found = await situacaoAlunoService.getById(created.id);
    expect(found.nome).toBe("Custom situacoes-test");
    expect(found.ativo).toBe(true);
  });

  it("throws SituacaoAlunoNotFoundError for missing id", async () => {
    await expect(
      situacaoAlunoService.getById("00000000-0000-0000-0000-000000000000")
    ).rejects.toThrow(SituacaoAlunoNotFoundError);
  });

  it("lists only active situacoes after soft delete", async () => {
    const a = await situacaoAlunoService.create({ nome: "A situacoes-test" });
    await situacaoAlunoService.create({ nome: "B situacoes-test" });
    await situacaoAlunoService.remove(a.id);

    const { items } = await situacaoAlunoService.list(1, 50);
    const nomes = items.map((s) => s.nome).filter((n) => n.includes("situacoes-test"));
    expect(nomes).toEqual(["B situacoes-test"]);
  });

  it("rejects creating a situacao with an empty nome", async () => {
    await expect(situacaoAlunoService.create({ nome: "" })).rejects.toThrow();
  });

  it("rejects creating a situacao with a duplicate nome", async () => {
    await situacaoAlunoService.create({ nome: "Dup situacoes-test" });
    await expect(situacaoAlunoService.create({ nome: "Dup situacoes-test" })).rejects.toThrow();
  });

  it("finds the seeded Ativo situacao by nome", async () => {
    const ativo = await situacaoAlunoService.findByNome("Ativo");
    expect(ativo?.nome).toBe("Ativo");
  });
});
```

- [ ] **Step 4: Run it, confirm it fails**

Run: `cd backend && npx vitest run situacoes-aluno.service.test.ts`
Expected: FAIL — `Cannot find module './situacoes-aluno.service.js'`.

- [ ] **Step 5: Implement the service**

`backend/src/modules/situacoes-aluno/situacoes-aluno.service.ts`:

```ts
import { situacaoAlunoRepository } from "./situacoes-aluno.repository.js";
import type { CreateSituacaoAlunoInput, UpdateSituacaoAlunoInput } from "./situacoes-aluno.types.js";

export class SituacaoAlunoNotFoundError extends Error {}
export class SituacaoAlunoValidationError extends Error {}

function assertValidNome(nome: string | undefined) {
  if (nome !== undefined && nome.trim().length === 0) {
    throw new SituacaoAlunoValidationError("nome não pode ser vazio");
  }
}

export const situacaoAlunoService = {
  list(page: number, pageSize: number) {
    return situacaoAlunoRepository.list(page, pageSize);
  },

  async getById(id: string) {
    const situacao = await situacaoAlunoRepository.findById(id);
    if (!situacao) {
      throw new SituacaoAlunoNotFoundError(id);
    }
    return situacao;
  },

  findByNome(nome: string) {
    return situacaoAlunoRepository.findByNome(nome);
  },

  async create(data: CreateSituacaoAlunoInput) {
    assertValidNome(data.nome);
    return situacaoAlunoRepository.create(data);
  },

  async update(id: string, data: UpdateSituacaoAlunoInput) {
    assertValidNome(data.nome);
    await this.getById(id);
    return situacaoAlunoRepository.update(id, data);
  },

  async remove(id: string) {
    await this.getById(id);
    return situacaoAlunoRepository.softDelete(id);
  }
};
```

- [ ] **Step 6: Run the service test again, confirm it passes**

Run: `cd backend && npx vitest run situacoes-aluno.service.test.ts`
Expected: PASS (6 tests).

- [ ] **Step 7: Write the failing routes test**

`backend/src/modules/situacoes-aluno/situacoes-aluno.routes.test.ts`:

```ts
import { describe, it, expect, beforeAll, beforeEach, afterAll } from "vitest";
import type { FastifyInstance } from "fastify";
import { buildApp } from "../../app.js";
import { prisma } from "../../core/prisma.js";
import { loadConfig } from "../../core/config.js";
import { signAccessToken } from "../../core/jwt.js";
import { hashPassword } from "../../core/password.js";

describe("situacoes-aluno routes", () => {
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
    authCookie = `access_token=${signAccessToken(user.id, user.role, config.jwtAccessSecret)}`;
  });

  beforeEach(async () => {
    await prisma.situacaoAluno.deleteMany({ where: { nome: { contains: "situacoes-routes-test" } } });
  });

  afterAll(async () => {
    await prisma.situacaoAluno.deleteMany({ where: { nome: { contains: "situacoes-routes-test" } } });
    await app.close();
    await prisma.$disconnect();
  });

  it("rejects unauthenticated requests", async () => {
    const response = await app.inject({ method: "GET", url: "/situacoes-aluno" });
    expect(response.statusCode).toBe(401);
  });

  it("creates then lists a situacao", async () => {
    const createRes = await app.inject({
      method: "POST",
      url: "/situacoes-aluno",
      headers: { cookie: authCookie },
      payload: { nome: "Custom situacoes-routes-test" }
    });
    expect(createRes.statusCode).toBe(201);

    const listRes = await app.inject({
      method: "GET",
      url: "/situacoes-aluno",
      headers: { cookie: authCookie }
    });
    expect(listRes.statusCode).toBe(200);
    const body = listRes.json();
    expect(body.items.some((s: { nome: string }) => s.nome === "Custom situacoes-routes-test")).toBe(
      true
    );
  });

  it("soft-deletes a situacao", async () => {
    const createRes = await app.inject({
      method: "POST",
      url: "/situacoes-aluno",
      headers: { cookie: authCookie },
      payload: { nome: "Para Remover situacoes-routes-test" }
    });
    const { id } = createRes.json();

    const deleteRes = await app.inject({
      method: "DELETE",
      url: `/situacoes-aluno/${id}`,
      headers: { cookie: authCookie }
    });
    expect(deleteRes.statusCode).toBe(200);

    const getRes = await app.inject({
      method: "GET",
      url: `/situacoes-aluno/${id}`,
      headers: { cookie: authCookie }
    });
    expect(getRes.json().ativo).toBe(false);
  });
});
```

- [ ] **Step 8: Run it, confirm it fails**

Run: `cd backend && npx vitest run situacoes-aluno.routes.test.ts`
Expected: FAIL — route not registered / module not found.

- [ ] **Step 9: Implement the routes**

`backend/src/modules/situacoes-aluno/situacoes-aluno.routes.ts`:

```ts
import type { FastifyInstance } from "fastify";
import {
  situacaoAlunoService,
  SituacaoAlunoNotFoundError,
  SituacaoAlunoValidationError
} from "./situacoes-aluno.service.js";
import { requireAuth } from "../../core/auth-hook.js";
import type { Config } from "../../core/config.js";
import type { CreateSituacaoAlunoInput, UpdateSituacaoAlunoInput } from "./situacoes-aluno.types.js";

export function registerSituacoesAlunoRoutes(app: FastifyInstance, config: Config) {
  const auth = { preHandler: requireAuth(config) };

  app.get<{ Querystring: { page?: string; pageSize?: string } }>(
    "/situacoes-aluno",
    auth,
    async (request) => {
      const page = Number(request.query.page ?? 1);
      const pageSize = Number(request.query.pageSize ?? 20);
      return situacaoAlunoService.list(page, pageSize);
    }
  );

  app.get<{ Params: { id: string } }>("/situacoes-aluno/:id", auth, async (request, reply) => {
    try {
      return await situacaoAlunoService.getById(request.params.id);
    } catch (err) {
      if (err instanceof SituacaoAlunoNotFoundError) {
        return reply.code(404).send({ error: "Situação não encontrada" });
      }
      throw err;
    }
  });

  app.post<{ Body: CreateSituacaoAlunoInput }>("/situacoes-aluno", auth, async (request, reply) => {
    try {
      const situacao = await situacaoAlunoService.create(request.body);
      return reply.code(201).send(situacao);
    } catch (err) {
      if (err instanceof SituacaoAlunoValidationError) {
        return reply.code(400).send({ error: err.message });
      }
      throw err;
    }
  });

  app.put<{ Params: { id: string }; Body: UpdateSituacaoAlunoInput }>(
    "/situacoes-aluno/:id",
    auth,
    async (request, reply) => {
      try {
        return await situacaoAlunoService.update(request.params.id, request.body);
      } catch (err) {
        if (err instanceof SituacaoAlunoNotFoundError) {
          return reply.code(404).send({ error: "Situação não encontrada" });
        }
        if (err instanceof SituacaoAlunoValidationError) {
          return reply.code(400).send({ error: err.message });
        }
        throw err;
      }
    }
  );

  app.delete<{ Params: { id: string } }>("/situacoes-aluno/:id", auth, async (request, reply) => {
    try {
      return await situacaoAlunoService.remove(request.params.id);
    } catch (err) {
      if (err instanceof SituacaoAlunoNotFoundError) {
        return reply.code(404).send({ error: "Situação não encontrada" });
      }
      throw err;
    }
  });
}
```

- [ ] **Step 10: Register the routes in `app.ts`**

Add the import near the other module imports in `backend/src/app.ts`:

```ts
import { registerSituacoesAlunoRoutes } from "./modules/situacoes-aluno/situacoes-aluno.routes.js";
```

Add the registration call next to `registerAlunosRoutes(app, config);`:

```ts
  registerAlunosRoutes(app, config);
  registerSituacoesAlunoRoutes(app, config);
```

- [ ] **Step 11: Run both test files, confirm they pass**

Run: `cd backend && npx vitest run situacoes-aluno`
Expected: PASS (all tests in both files).

- [ ] **Step 12: Commit**

```bash
git add backend/src/modules/situacoes-aluno backend/src/app.ts
git commit -m "feat(backend): add situacoes-aluno cadastro CRUD"
```

---

### Task 3: `aluno-situacoes` sub-resource (change + history)

**Files:**
- Create: `backend/src/modules/aluno-situacoes/aluno-situacoes.types.ts`
- Create: `backend/src/modules/aluno-situacoes/aluno-situacoes.repository.ts`
- Create: `backend/src/modules/aluno-situacoes/aluno-situacoes.service.ts`
- Create: `backend/src/modules/aluno-situacoes/aluno-situacoes.service.test.ts`
- Create: `backend/src/modules/aluno-situacoes/aluno-situacoes.routes.ts`
- Create: `backend/src/modules/aluno-situacoes/aluno-situacoes.routes.test.ts`
- Modify: `backend/src/app.ts`

**Interfaces:**
- Consumes: `alunoService.getById` + `AlunoNotFoundError` from `../alunos/alunos.service.js`; `situacaoAlunoService.getById` + `SituacaoAlunoNotFoundError` from `../situacoes-aluno/situacoes-aluno.service.js` (Task 2).
- Produces: `alunoSituacaoService.listByAluno(alunoId)`, `alunoSituacaoService.changeSituacao(alunoId, data)`, `AlunoSituacaoValidationError`, `SituacaoInativaError`, `registerAlunoSituacoesRoutes(app, config)`.

- [ ] **Step 1: Types**

`backend/src/modules/aluno-situacoes/aluno-situacoes.types.ts`:

```ts
export interface CreateAlunoSituacaoInput {
  situacaoId: string;
  dataMudanca: string;
  observacao?: string;
}
```

- [ ] **Step 2: Repository**

`backend/src/modules/aluno-situacoes/aluno-situacoes.repository.ts`:

```ts
import { prisma } from "../../core/prisma.js";

const INCLUDE = {
  situacao: { select: { id: true, nome: true } }
} as const;

export const alunoSituacaoRepository = {
  listByAluno(alunoId: string) {
    return prisma.alunoSituacaoHistorico.findMany({
      where: { alunoId },
      include: INCLUDE,
      orderBy: { dataMudanca: "desc" }
    });
  },

  async changeSituacao(
    alunoId: string,
    situacaoId: string,
    dataMudanca: Date,
    observacao: string | undefined
  ) {
    return prisma.$transaction(async (tx) => {
      const historico = await tx.alunoSituacaoHistorico.create({
        data: { alunoId, situacaoId, dataMudanca, observacao },
        include: INCLUDE
      });
      await tx.aluno.update({ where: { id: alunoId }, data: { situacaoAtualId: situacaoId } });
      return historico;
    });
  }
};
```

- [ ] **Step 3: Write the failing service test**

`backend/src/modules/aluno-situacoes/aluno-situacoes.service.test.ts`:

```ts
import { describe, it, expect, beforeEach, afterAll } from "vitest";
import { prisma } from "../../core/prisma.js";
import { alunoService } from "../alunos/alunos.service.js";
import { situacaoAlunoService } from "../situacoes-aluno/situacoes-aluno.service.js";
import {
  alunoSituacaoService,
  SituacaoInativaError,
  AlunoSituacaoValidationError
} from "./aluno-situacoes.service.js";

describe("alunoSituacaoService", () => {
  let alunoId: string;
  let transferidoId: string;

  beforeEach(async () => {
    await prisma.alunoSituacaoHistorico.deleteMany();
    await prisma.aluno.deleteMany({ where: { nome: { contains: "aluno-sit-test" } } });
    await prisma.turma.deleteMany({ where: { nome: { contains: "aluno-sit-test" } } });
    await prisma.escola.deleteMany({ where: { nome: { contains: "aluno-sit-test" } } });
    await prisma.periodo.deleteMany({ where: { nome: { contains: "aluno-sit-test" } } });

    const escola = await prisma.escola.create({ data: { nome: "Escola aluno-sit-test" } });
    const periodo = await prisma.periodo.create({ data: { nome: "Periodo aluno-sit-test" } });
    const turma = await prisma.turma.create({
      data: { nome: "Turma aluno-sit-test", serie: "6 Ano", escolaId: escola.id, periodoId: periodo.id }
    });
    const aluno = await alunoService.create({ nome: "Aluno aluno-sit-test", turmaId: turma.id });
    alunoId = aluno.id;

    const transferido = await situacaoAlunoService.findByNome("Transferido");
    transferidoId = transferido!.id;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("changes the situacao and records history with the current situacao updated", async () => {
    await alunoSituacaoService.changeSituacao(alunoId, {
      situacaoId: transferidoId,
      dataMudanca: "2026-08-01"
    });

    const aluno = await alunoService.getById(alunoId);
    expect(aluno.situacaoAtual.nome).toBe("Transferido");

    const historico = await alunoSituacaoService.listByAluno(alunoId);
    expect(historico).toHaveLength(2);
    expect(historico[0].situacao.nome).toBe("Transferido");
  });

  it("rejects changing to an inactive situacao", async () => {
    const custom = await situacaoAlunoService.create({ nome: "Descartada aluno-sit-test" });
    await situacaoAlunoService.remove(custom.id);

    await expect(
      alunoSituacaoService.changeSituacao(alunoId, {
        situacaoId: custom.id,
        dataMudanca: "2026-08-01"
      })
    ).rejects.toThrow(SituacaoInativaError);
  });

  it("rejects an empty dataMudanca", async () => {
    await expect(
      alunoSituacaoService.changeSituacao(alunoId, { situacaoId: transferidoId, dataMudanca: "" })
    ).rejects.toThrow(AlunoSituacaoValidationError);
  });
});
```

- [ ] **Step 4: Run it, confirm it fails**

Run: `cd backend && npx vitest run aluno-situacoes.service.test.ts`
Expected: FAIL — `Cannot find module './aluno-situacoes.service.js'`.

- [ ] **Step 5: Implement the service**

`backend/src/modules/aluno-situacoes/aluno-situacoes.service.ts`:

```ts
import { alunoSituacaoRepository } from "./aluno-situacoes.repository.js";
import { alunoService } from "../alunos/alunos.service.js";
import { situacaoAlunoService } from "../situacoes-aluno/situacoes-aluno.service.js";
import type { CreateAlunoSituacaoInput } from "./aluno-situacoes.types.js";

export class AlunoSituacaoValidationError extends Error {}
export class SituacaoInativaError extends Error {}

export const alunoSituacaoService = {
  async listByAluno(alunoId: string) {
    await alunoService.getById(alunoId);
    return alunoSituacaoRepository.listByAluno(alunoId);
  },

  async changeSituacao(alunoId: string, data: CreateAlunoSituacaoInput) {
    if (!data.situacaoId) {
      throw new AlunoSituacaoValidationError("situação é obrigatória");
    }
    if (!data.dataMudanca) {
      throw new AlunoSituacaoValidationError("data da mudança é obrigatória");
    }

    await alunoService.getById(alunoId);
    const situacao = await situacaoAlunoService.getById(data.situacaoId);
    if (!situacao.ativo) {
      throw new SituacaoInativaError("situação selecionada está inativa");
    }

    return alunoSituacaoRepository.changeSituacao(
      alunoId,
      data.situacaoId,
      new Date(data.dataMudanca),
      data.observacao
    );
  }
};
```

- [ ] **Step 6: Run the service test again, confirm it passes**

Run: `cd backend && npx vitest run aluno-situacoes.service.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 7: Write the failing routes test**

`backend/src/modules/aluno-situacoes/aluno-situacoes.routes.test.ts`:

```ts
import { describe, it, expect, beforeAll, beforeEach, afterAll } from "vitest";
import type { FastifyInstance } from "fastify";
import { buildApp } from "../../app.js";
import { prisma } from "../../core/prisma.js";
import { loadConfig } from "../../core/config.js";
import { signAccessToken } from "../../core/jwt.js";
import { hashPassword } from "../../core/password.js";

describe("aluno-situacoes routes", () => {
  let app: FastifyInstance;
  let authCookie: string;
  let alunoId: string;
  let transferidoId: string;

  beforeAll(async () => {
    app = await buildApp();
    const config = loadConfig();
    const user = await prisma.user.upsert({
      where: { email: "routes-test@example.com" },
      update: { role: "ADMIN" },
      create: {
        email: "routes-test@example.com",
        passwordHash: await hashPassword("x"),
        name: "Tester",
        role: "ADMIN"
      }
    });
    authCookie = `access_token=${signAccessToken(user.id, user.role, config.jwtAccessSecret)}`;
    const transferido = await prisma.situacaoAluno.findUniqueOrThrow({ where: { nome: "Transferido" } });
    transferidoId = transferido.id;
  });

  beforeEach(async () => {
    await prisma.alunoSituacaoHistorico.deleteMany();
    await prisma.aluno.deleteMany({ where: { nome: { contains: "aluno-sit-routes-test" } } });
    await prisma.turma.deleteMany({ where: { nome: { contains: "aluno-sit-routes-test" } } });
    await prisma.escola.deleteMany({ where: { nome: { contains: "aluno-sit-routes-test" } } });
    await prisma.periodo.deleteMany({ where: { nome: { contains: "aluno-sit-routes-test" } } });

    const escola = await prisma.escola.create({ data: { nome: "Escola aluno-sit-routes-test" } });
    const periodo = await prisma.periodo.create({ data: { nome: "Periodo aluno-sit-routes-test" } });
    const turma = await prisma.turma.create({
      data: {
        nome: "Turma aluno-sit-routes-test",
        serie: "6 Ano",
        escolaId: escola.id,
        periodoId: periodo.id
      }
    });
    const situacaoAtiva = await prisma.situacaoAluno.findUniqueOrThrow({ where: { nome: "Ativo" } });
    const aluno = await prisma.aluno.create({
      data: {
        nome: "Aluno aluno-sit-routes-test",
        turmaId: turma.id,
        situacaoAtualId: situacaoAtiva.id
      }
    });
    alunoId = aluno.id;
  });

  afterAll(async () => {
    await prisma.alunoSituacaoHistorico.deleteMany();
    await prisma.aluno.deleteMany({ where: { nome: { contains: "aluno-sit-routes-test" } } });
    await prisma.turma.deleteMany({ where: { nome: { contains: "aluno-sit-routes-test" } } });
    await prisma.escola.deleteMany({ where: { nome: { contains: "aluno-sit-routes-test" } } });
    await prisma.periodo.deleteMany({ where: { nome: { contains: "aluno-sit-routes-test" } } });
    await app.close();
    await prisma.$disconnect();
  });

  it("rejects unauthenticated requests", async () => {
    const response = await app.inject({ method: "GET", url: `/alunos/${alunoId}/situacoes` });
    expect(response.statusCode).toBe(401);
  });

  it("changes situacao and lists history", async () => {
    const changeRes = await app.inject({
      method: "POST",
      url: `/alunos/${alunoId}/situacoes`,
      headers: { cookie: authCookie },
      payload: { situacaoId: transferidoId, dataMudanca: "2026-08-01" }
    });
    expect(changeRes.statusCode).toBe(201);
    expect(changeRes.json().situacao.nome).toBe("Transferido");

    const listRes = await app.inject({
      method: "GET",
      url: `/alunos/${alunoId}/situacoes`,
      headers: { cookie: authCookie }
    });
    expect(listRes.json()).toHaveLength(2);
  });
});
```

- [ ] **Step 8: Run it, confirm it fails**

Run: `cd backend && npx vitest run aluno-situacoes.routes.test.ts`
Expected: FAIL — route not registered / module not found.

- [ ] **Step 9: Implement the routes**

`backend/src/modules/aluno-situacoes/aluno-situacoes.routes.ts`:

```ts
import type { FastifyInstance } from "fastify";
import {
  alunoSituacaoService,
  AlunoSituacaoValidationError,
  SituacaoInativaError
} from "./aluno-situacoes.service.js";
import { AlunoNotFoundError } from "../alunos/alunos.service.js";
import { SituacaoAlunoNotFoundError } from "../situacoes-aluno/situacoes-aluno.service.js";
import { requireAuth } from "../../core/auth-hook.js";
import type { Config } from "../../core/config.js";
import type { CreateAlunoSituacaoInput } from "./aluno-situacoes.types.js";

export function registerAlunoSituacoesRoutes(app: FastifyInstance, config: Config) {
  const auth = { preHandler: requireAuth(config) };

  app.get<{ Params: { alunoId: string } }>(
    "/alunos/:alunoId/situacoes",
    auth,
    async (request, reply) => {
      try {
        return await alunoSituacaoService.listByAluno(request.params.alunoId);
      } catch (err) {
        if (err instanceof AlunoNotFoundError) {
          return reply.code(404).send({ error: "Aluno não encontrado" });
        }
        throw err;
      }
    }
  );

  app.post<{ Params: { alunoId: string }; Body: CreateAlunoSituacaoInput }>(
    "/alunos/:alunoId/situacoes",
    auth,
    async (request, reply) => {
      try {
        const historico = await alunoSituacaoService.changeSituacao(
          request.params.alunoId,
          request.body
        );
        return reply.code(201).send(historico);
      } catch (err) {
        if (err instanceof AlunoNotFoundError || err instanceof SituacaoAlunoNotFoundError) {
          return reply.code(404).send({ error: "Aluno ou situação não encontrado(a)" });
        }
        if (err instanceof AlunoSituacaoValidationError || err instanceof SituacaoInativaError) {
          return reply.code(400).send({ error: err.message });
        }
        throw err;
      }
    }
  );
}
```

- [ ] **Step 10: Register the routes in `app.ts`**

Add the import:

```ts
import { registerAlunoSituacoesRoutes } from "./modules/aluno-situacoes/aluno-situacoes.routes.js";
```

Add the registration call next to `registerAlunoResponsaveisRoutes(app, config);`:

```ts
  registerAlunoResponsaveisRoutes(app, config);
  registerAlunoSituacoesRoutes(app, config);
```

- [ ] **Step 11: Run both test files, confirm they pass**

Run: `cd backend && npx vitest run aluno-situacoes`
Expected: PASS (all tests in both files).

- [ ] **Step 12: Commit**

```bash
git add backend/src/modules/aluno-situacoes backend/src/app.ts
git commit -m "feat(backend): add aluno situacao change endpoint with history"
```

---

### Task 4: Wire Alunos to default + expose situacaoAtual

**Files:**
- Modify: `backend/src/modules/alunos/alunos.repository.ts`
- Modify: `backend/src/modules/alunos/alunos.service.ts`
- Modify: `backend/src/modules/alunos/alunos.service.test.ts`
- Modify: `backend/src/modules/alunos/alunos.routes.test.ts`

**Interfaces:**
- Consumes: `situacaoAlunoRepository.findByNome` from `../situacoes-aluno/situacoes-aluno.repository.js` (Task 2), `alunoSituacaoRepository` history-create pattern (mirrored inline, not imported, to keep the create atomic with the aluno insert).
- Produces: `Aluno` objects now always include `situacaoAtual: { id, nome }`; `alunoService.create` never needs a situação in its input.

- [ ] **Step 1: Update the repository — include `situacaoAtual`, assign it, and log history on create**

Replace the full contents of `backend/src/modules/alunos/alunos.repository.ts`:

```ts
import { prisma } from "../../core/prisma.js";
import type { CreateAlunoInput, UpdateAlunoInput } from "./alunos.types.js";

const INCLUDE = {
  turma: { select: { id: true, nome: true } },
  situacaoAtual: { select: { id: true, nome: true } }
} as const;

function toUpdateData(data: UpdateAlunoInput) {
  return {
    ...data,
    dataNascimento: data.dataNascimento ? new Date(data.dataNascimento) : undefined
  };
}

export const alunoRepository = {
  async list(page: number, pageSize: number, turmaId?: string) {
    const where = { ativo: true, ...(turmaId ? { turmaId } : {}) };
    const [items, total] = await Promise.all([
      prisma.aluno.findMany({
        where,
        include: INCLUDE,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { nome: "asc" }
      }),
      prisma.aluno.count({ where })
    ]);
    return { items, total };
  },

  findById(id: string) {
    return prisma.aluno.findUnique({ where: { id }, include: INCLUDE });
  },

  create(data: CreateAlunoInput & { situacaoAtualId: string }) {
    const { situacaoAtualId, ...alunoData } = data;
    return prisma.$transaction(async (tx) => {
      const aluno = await tx.aluno.create({
        data: {
          ...alunoData,
          dataNascimento: alunoData.dataNascimento ? new Date(alunoData.dataNascimento) : undefined,
          situacaoAtualId
        },
        include: INCLUDE
      });
      await tx.alunoSituacaoHistorico.create({
        data: { alunoId: aluno.id, situacaoId: situacaoAtualId, dataMudanca: aluno.createdAt }
      });
      return aluno;
    });
  },

  update(id: string, data: UpdateAlunoInput) {
    return prisma.aluno.update({ where: { id }, data: toUpdateData(data), include: INCLUDE });
  },

  softDelete(id: string) {
    return prisma.aluno.update({ where: { id }, data: { ativo: false } });
  }
};
```

- [ ] **Step 2: Update the service to assign the default situação**

In `backend/src/modules/alunos/alunos.service.ts`, add the import and change `create`:

```ts
import { alunoRepository } from "./alunos.repository.js";
import { situacaoAlunoRepository } from "../situacoes-aluno/situacoes-aluno.repository.js";
import type { CreateAlunoInput, UpdateAlunoInput } from "./alunos.types.js";
```

Replace the `create` method:

```ts
  async create(data: CreateAlunoInput) {
    assertValid(data);
    const situacaoAtiva = await situacaoAlunoRepository.findByNome("Ativo");
    if (!situacaoAtiva) {
      throw new AlunoValidationError("situação padrão 'Ativo' não está cadastrada");
    }
    return alunoRepository.create({ ...data, situacaoAtualId: situacaoAtiva.id });
  },
```

- [ ] **Step 3: Add assertions to the existing service test**

In `backend/src/modules/alunos/alunos.service.test.ts`, update the first test and add a new one:

```ts
  it("creates and retrieves an aluno with its turma", async () => {
    const created = await alunoService.create({ nome: "Fulano", turmaId });
    const found = await alunoService.getById(created.id);
    expect(found.nome).toBe("Fulano");
    expect(found.turma.id).toBe(turmaId);
  });

  it("assigns the default situacao 'Ativo' on creation", async () => {
    const created = await alunoService.create({ nome: "Beltrano", turmaId });
    expect(created.situacaoAtual.nome).toBe("Ativo");
  });
```

(Only the second `it` block is new; the first is unchanged and shown for placement context — insert the new block directly after it.)

- [ ] **Step 4: Add an assertion to the routes test**

In `backend/src/modules/alunos/alunos.routes.test.ts`, extend the "creates then lists" test:

```ts
  it("creates then lists an aluno, with nested turma", async () => {
    const createRes = await app.inject({
      method: "POST",
      url: "/alunos",
      headers: { cookie: authCookie },
      payload: { nome: "Aluno Teste", turmaId }
    });
    expect(createRes.statusCode).toBe(201);
    expect(createRes.json().turma.id).toBe(turmaId);
    expect(createRes.json().situacaoAtual.nome).toBe("Ativo");

    const listRes = await app.inject({
      method: "GET",
      url: "/alunos",
      headers: { cookie: authCookie }
    });
    expect(listRes.statusCode).toBe(200);
    expect(listRes.json().items).toHaveLength(1);
  });
```

- [ ] **Step 5: Run the full backend test suite, confirm everything passes now**

Run: `cd backend && npx vitest run`
Expected: PASS, all suites (including `alunos.service.test.ts` and `alunos.routes.test.ts`, resolving the gap left open since Task 1).

- [ ] **Step 6: Commit**

```bash
git add backend/src/modules/alunos
git commit -m "feat(backend): default new alunos to situacao Ativo with history"
```

---

### Task 5: `situacoes-aluno` cadastro module (frontend)

**Files:**
- Create: `frontend/src/modules/situacoes-aluno/types.ts`
- Create: `frontend/src/modules/situacoes-aluno/services/situacoes-aluno.service.ts`
- Create: `frontend/src/modules/situacoes-aluno/hooks/useSituacoesAluno.ts`
- Create: `frontend/src/modules/situacoes-aluno/components/SituacaoAlunoForm.tsx`
- Create: `frontend/src/modules/situacoes-aluno/components/SituacaoAlunoList.tsx`
- Create: `frontend/src/modules/situacoes-aluno/components/SituacaoAlunoList.test.tsx`
- Create: `frontend/src/modules/situacoes-aluno/pages/SituacoesAlunoPage.tsx`
- Modify: `frontend/src/router.tsx`
- Modify: `frontend/src/core/Layout.tsx`

**Interfaces:**
- Consumes: `apiClient` from `../../../core/apiClient.js`, `Button`/`Modal`/`Table` from `../../../shared/components/*`, `useConfirm` from `../../../shared/contexts/ConfirmContext.js`.
- Produces: `SituacaoAluno` type (`{ id, nome, ativo }`), `situacoesAlunoService`, `useSituacoesAluno()` hook, `/situacoes-aluno` route + nav entry. Task 6's `useSituacaoOptions` hook hits the same `/situacoes-aluno` endpoint, independently.

- [ ] **Step 1: Types**

`frontend/src/modules/situacoes-aluno/types.ts`:

```ts
export interface SituacaoAluno {
  id: string;
  nome: string;
  ativo: boolean;
}

export interface CreateSituacaoAlunoInput {
  nome: string;
}

export type UpdateSituacaoAlunoInput = Partial<CreateSituacaoAlunoInput>;
```

- [ ] **Step 2: Service**

`frontend/src/modules/situacoes-aluno/services/situacoes-aluno.service.ts`:

```ts
import { apiClient } from "../../../core/apiClient.js";
import type { SituacaoAluno, CreateSituacaoAlunoInput, UpdateSituacaoAlunoInput } from "../types.js";

interface SituacaoAlunoListResponse {
  items: SituacaoAluno[];
  total: number;
}

export const situacoesAlunoService = {
  list: () => apiClient.get<SituacaoAlunoListResponse>("/situacoes-aluno"),
  create: (data: CreateSituacaoAlunoInput) =>
    apiClient.post<SituacaoAluno>("/situacoes-aluno", data),
  update: (id: string, data: UpdateSituacaoAlunoInput) =>
    apiClient.put<SituacaoAluno>(`/situacoes-aluno/${id}`, data),
  remove: (id: string) => apiClient.del<SituacaoAluno>(`/situacoes-aluno/${id}`)
};
```

- [ ] **Step 3: Hook**

`frontend/src/modules/situacoes-aluno/hooks/useSituacoesAluno.ts`:

```ts
import { useCallback, useEffect, useState } from "react";
import { situacoesAlunoService } from "../services/situacoes-aluno.service.js";
import type { SituacaoAluno, CreateSituacaoAlunoInput, UpdateSituacaoAlunoInput } from "../types.js";

export function useSituacoesAluno() {
  const [situacoes, setSituacoes] = useState<SituacaoAluno[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const { items } = await situacoesAlunoService.list();
    setSituacoes(items);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function create(data: CreateSituacaoAlunoInput) {
    await situacoesAlunoService.create(data);
    await refresh();
  }

  async function update(id: string, data: UpdateSituacaoAlunoInput) {
    await situacoesAlunoService.update(id, data);
    await refresh();
  }

  async function remove(id: string) {
    await situacoesAlunoService.remove(id);
    await refresh();
  }

  return { situacoes, loading, create, update, remove };
}
```

- [ ] **Step 4: Form component**

`frontend/src/modules/situacoes-aluno/components/SituacaoAlunoForm.tsx`:

```tsx
import { useState, FormEvent } from "react";
import { Button } from "../../../shared/components/Button.js";
import type { CreateSituacaoAlunoInput } from "../types.js";

interface SituacaoAlunoFormProps {
  initial?: CreateSituacaoAlunoInput;
  submitLabel: string;
  onSubmit: (data: CreateSituacaoAlunoInput) => Promise<void>;
}

export function SituacaoAlunoForm({ initial, submitLabel, onSubmit }: SituacaoAlunoFormProps) {
  const [nome, setNome] = useState(initial?.nome ?? "");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await onSubmit({ nome });
      if (!initial) {
        setNome("");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível salvar a situação.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        placeholder="Nome da situação"
        className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
      />
      <Button type="submit">{submitLabel}</Button>
      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}
    </form>
  );
}
```

- [ ] **Step 5: Write the failing list-component test**

`frontend/src/modules/situacoes-aluno/components/SituacaoAlunoList.test.tsx`:

```tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { SituacaoAlunoList } from "./SituacaoAlunoList.js";
import type { SituacaoAluno } from "../types.js";

describe("SituacaoAlunoList", () => {
  it("renders situacoes and calls onEdit/onRemove when clicked", () => {
    const situacoes: SituacaoAluno[] = [{ id: "1", nome: "Ativo", ativo: true }];
    const onEdit = vi.fn();
    const onRemove = vi.fn();

    render(<SituacaoAlunoList situacoes={situacoes} onEdit={onEdit} onRemove={onRemove} />);

    expect(screen.getByText("Ativo")).toBeTruthy();

    fireEvent.click(screen.getByText("Editar"));
    expect(onEdit).toHaveBeenCalledWith(situacoes[0]);

    fireEvent.click(screen.getByText("Remover"));
    expect(onRemove).toHaveBeenCalledWith("1");
  });
});
```

- [ ] **Step 6: Run it, confirm it fails**

Run: `cd frontend && npx vitest run SituacaoAlunoList.test.tsx`
Expected: FAIL — `Cannot find module './SituacaoAlunoList.js'`.

- [ ] **Step 7: Implement the list component**

`frontend/src/modules/situacoes-aluno/components/SituacaoAlunoList.tsx`:

```tsx
import { Pencil, Trash2 } from "lucide-react";
import { Table } from "../../../shared/components/Table.js";
import { Button } from "../../../shared/components/Button.js";
import type { SituacaoAluno } from "../types.js";

interface SituacaoAlunoListProps {
  situacoes: SituacaoAluno[];
  onEdit: (situacao: SituacaoAluno) => void;
  onRemove: (id: string) => void;
}

export function SituacaoAlunoList({ situacoes, onEdit, onRemove }: SituacaoAlunoListProps) {
  return (
    <Table<SituacaoAluno>
      columns={[
        { key: "nome", header: "Nome" },
        {
          key: "acoes",
          header: "Ações",
          render: (situacao) => (
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => onEdit(situacao)}>
                <Pencil className="mr-1.5 h-3.5 w-3.5" strokeWidth={2} />
                Editar
              </Button>
              <Button variant="danger" onClick={() => onRemove(situacao.id)}>
                <Trash2 className="mr-1.5 h-3.5 w-3.5" strokeWidth={2} />
                Remover
              </Button>
            </div>
          )
        }
      ]}
      rows={situacoes}
      rowKey={(s) => s.id}
    />
  );
}
```

- [ ] **Step 8: Run it again, confirm it passes**

Run: `cd frontend && npx vitest run SituacaoAlunoList.test.tsx`
Expected: PASS.

- [ ] **Step 9: Page**

`frontend/src/modules/situacoes-aluno/pages/SituacoesAlunoPage.tsx`:

```tsx
import { useState } from "react";
import { SlidersHorizontal, Plus } from "lucide-react";
import { useSituacoesAluno } from "../hooks/useSituacoesAluno.js";
import { SituacaoAlunoForm } from "../components/SituacaoAlunoForm.js";
import { SituacaoAlunoList } from "../components/SituacaoAlunoList.js";
import { Modal } from "../../../shared/components/Modal.js";
import { Button } from "../../../shared/components/Button.js";
import { useConfirm } from "../../../shared/contexts/ConfirmContext.js";
import type { SituacaoAluno, CreateSituacaoAlunoInput } from "../types.js";

export function SituacoesAlunoPage() {
  const { situacoes, loading, create, update, remove } = useSituacoesAluno();
  const confirm = useConfirm();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<SituacaoAluno | null>(null);

  if (loading) {
    return <p className="text-zinc-500">Carregando...</p>;
  }

  function openCreate() {
    setEditing(null);
    setModalOpen(true);
  }

  function openEdit(situacao: SituacaoAluno) {
    setEditing(situacao);
    setModalOpen(true);
  }

  async function handleSubmit(data: CreateSituacaoAlunoInput) {
    if (editing) {
      const ok = await confirm({
        title: "Salvar alterações",
        message: "Confirma a alteração desta situação?",
        confirmLabel: "Salvar"
      });
      if (!ok) {
        return;
      }
      await update(editing.id, data);
    } else {
      await create(data);
    }
    setModalOpen(false);
  }

  async function handleRemove(id: string) {
    const ok = await confirm({
      title: "Remover situação",
      message: "Tem certeza que deseja remover esta situação?",
      confirmLabel: "Remover",
      variant: "danger"
    });
    if (ok) {
      await remove(id);
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <SlidersHorizontal className="h-5 w-5 text-zinc-400" strokeWidth={2} />
          <h1 className="text-xl font-semibold text-zinc-900">Situações</h1>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-1.5 h-4 w-4" strokeWidth={2.25} />
          Nova Situação
        </Button>
      </div>
      <SituacaoAlunoList situacoes={situacoes} onEdit={openEdit} onRemove={handleRemove} />
      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <SituacaoAlunoForm
          initial={editing ? { nome: editing.nome } : undefined}
          submitLabel={editing ? "Salvar" : "Adicionar"}
          onSubmit={handleSubmit}
        />
      </Modal>
    </div>
  );
}
```

- [ ] **Step 10: Route**

In `frontend/src/router.tsx`, add the import:

```ts
import { SituacoesAlunoPage } from "./modules/situacoes-aluno/pages/SituacoesAlunoPage.js";
```

Add the route entry next to `{ path: "alunos", element: <AlunosPage /> },`:

```ts
      { path: "alunos", element: <AlunosPage /> },
      { path: "situacoes-aluno", element: <SituacoesAlunoPage /> },
```

- [ ] **Step 11: Nav entry**

In `frontend/src/core/Layout.tsx`, add `SlidersHorizontal` is already imported (reused for Indicadores) — import a distinct icon instead, e.g. `Repeat2`, to avoid visually duplicating the Indicadores entry. Add to the lucide-react import list:

```ts
  Repeat2
```

Add to `NAV_ITEMS`, right after the Alunos entry:

```ts
  { to: "/alunos", label: "Alunos", icon: StudentIcon, adminOnly: false },
  { to: "/situacoes-aluno", label: "Situações", icon: Repeat2, adminOnly: false },
```

- [ ] **Step 12: Manually verify in the browser**

Run `cd frontend && npm run dev`, log in, open "Situações" in the nav, confirm the four seeded rows (Ativo, Baixa Transferência, Transferido, Remanejamento) show up, and that create/edit/remove work with confirmation dialogs.

- [ ] **Step 13: Commit**

```bash
git add frontend/src/modules/situacoes-aluno frontend/src/router.tsx frontend/src/core/Layout.tsx
git commit -m "feat(frontend): add Situações cadastro page"
```

---

### Task 6: `useSituacaoOptions` shared hook

**Files:**
- Create: `frontend/src/shared/hooks/useSituacaoOptions.ts`

**Interfaces:**
- Consumes: `apiClient`, `Option` type (already exist).
- Produces: `useSituacaoOptions()` returning `{ situacoes: Option[], loading: boolean }`. Consumed by Task 8's `AlunoSituacaoPanel`.

- [ ] **Step 1: Implement the hook**

`frontend/src/shared/hooks/useSituacaoOptions.ts`:

```ts
import { useEffect, useState } from "react";
import { apiClient } from "../../core/apiClient.js";
import type { Option } from "../types.js";

interface SituacaoListResponse {
  items: Option[];
  total: number;
}

export function useSituacaoOptions() {
  const [situacoes, setSituacoes] = useState<Option[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    apiClient.get<SituacaoListResponse>("/situacoes-aluno").then((result) => {
      if (!cancelled) {
        setSituacoes(result.items);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return { situacoes, loading };
}
```

- [ ] **Step 2: Manually verify**

There's no existing test convention for these thin options hooks (`useTurmaOptions`, `useResponsavelOptions` have none) — skip a dedicated test file, consistent with the established pattern. Verify it compiles: `cd frontend && npx tsc --noEmit`.
Expected: no new errors.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/shared/hooks/useSituacaoOptions.ts
git commit -m "feat(frontend): add useSituacaoOptions hook"
```

---

### Task 7: `aluno-situacoes` frontend module (history + change)

**Files:**
- Create: `frontend/src/modules/aluno-situacoes/types.ts`
- Create: `frontend/src/modules/aluno-situacoes/services/aluno-situacoes.service.ts`
- Create: `frontend/src/modules/aluno-situacoes/hooks/useAlunoSituacoes.ts`

**Interfaces:**
- Consumes: `apiClient`.
- Produces: `AlunoSituacaoHistorico` type (`{ id, situacao: Option, dataMudanca, observacao, createdAt }`), `alunoSituacoesService`, `useAlunoSituacoes(alunoId)` returning `{ historico, loading, change }`. Consumed by Task 8's `AlunoSituacaoPanel`.

- [ ] **Step 1: Types**

`frontend/src/modules/aluno-situacoes/types.ts`:

```ts
import type { Option } from "../../shared/types.js";

export interface AlunoSituacaoHistorico {
  id: string;
  situacao: Option;
  dataMudanca: string;
  observacao: string | null;
  createdAt: string;
}

export interface CreateAlunoSituacaoInput {
  situacaoId: string;
  dataMudanca: string;
  observacao?: string;
}
```

- [ ] **Step 2: Service**

`frontend/src/modules/aluno-situacoes/services/aluno-situacoes.service.ts`:

```ts
import { apiClient } from "../../../core/apiClient.js";
import type { AlunoSituacaoHistorico, CreateAlunoSituacaoInput } from "../types.js";

export const alunoSituacoesService = {
  list: (alunoId: string) =>
    apiClient.get<AlunoSituacaoHistorico[]>(`/alunos/${alunoId}/situacoes`),
  change: (alunoId: string, data: CreateAlunoSituacaoInput) =>
    apiClient.post<AlunoSituacaoHistorico>(`/alunos/${alunoId}/situacoes`, data)
};
```

- [ ] **Step 3: Hook**

`frontend/src/modules/aluno-situacoes/hooks/useAlunoSituacoes.ts`:

```ts
import { useCallback, useEffect, useState } from "react";
import { alunoSituacoesService } from "../services/aluno-situacoes.service.js";
import type { AlunoSituacaoHistorico, CreateAlunoSituacaoInput } from "../types.js";

export function useAlunoSituacoes(alunoId: string) {
  const [historico, setHistorico] = useState<AlunoSituacaoHistorico[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const items = await alunoSituacoesService.list(alunoId);
    setHistorico(items);
    setLoading(false);
  }, [alunoId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function change(data: CreateAlunoSituacaoInput) {
    await alunoSituacoesService.change(alunoId, data);
    await refresh();
  }

  return { historico, loading, change };
}
```

- [ ] **Step 4: Verify it compiles**

Run: `cd frontend && npx tsc --noEmit`
Expected: no new errors.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/modules/aluno-situacoes
git commit -m "feat(frontend): add aluno-situacoes history hook and service"
```

---

### Task 8: `AlunoSituacaoPanel` + wire into Alunos UI

**Files:**
- Create: `frontend/src/modules/aluno-situacoes/components/AlunoSituacaoPanel.tsx`
- Modify: `frontend/src/modules/alunos/types.ts`
- Modify: `frontend/src/modules/alunos/components/AlunoList.tsx`
- Modify: `frontend/src/modules/alunos/pages/AlunosPage.tsx`

**Interfaces:**
- Consumes: `useAlunoSituacoes` + `AlunoSituacaoHistorico` (Task 7), `useSituacaoOptions` (Task 6), `useConfirm`, `Button`.
- Produces: `AlunoSituacaoPanel({ alunoId })` rendered inside the Aluno edit modal, next to `AlunoResponsavelPanel`.

- [ ] **Step 1: Add `situacaoAtual` to the frontend `Aluno` type**

In `frontend/src/modules/alunos/types.ts`, replace the `Aluno` interface:

```ts
export interface Aluno {
  id: string;
  nome: string;
  dataNascimento: string | null;
  turma: Option;
  situacaoAtual: Option;
  ativo: boolean;
}
```

- [ ] **Step 2: Build the panel**

`frontend/src/modules/aluno-situacoes/components/AlunoSituacaoPanel.tsx`:

```tsx
import { useState, FormEvent } from "react";
import { useAlunoSituacoes } from "../hooks/useAlunoSituacoes.js";
import { useSituacaoOptions } from "../../../shared/hooks/useSituacaoOptions.js";
import { Button } from "../../../shared/components/Button.js";
import { useConfirm } from "../../../shared/contexts/ConfirmContext.js";

interface AlunoSituacaoPanelProps {
  alunoId: string;
}

const SELECT_CLASSES =
  "flex-1 rounded-md border border-zinc-300 px-2 py-1.5 text-sm focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR", { timeZone: "UTC" });
}

export function AlunoSituacaoPanel({ alunoId }: AlunoSituacaoPanelProps) {
  const { historico, loading, change } = useAlunoSituacoes(alunoId);
  const { situacoes } = useSituacaoOptions();
  const confirm = useConfirm();
  const [situacaoId, setSituacaoId] = useState("");
  const [dataMudanca, setDataMudanca] = useState(() => new Date().toISOString().slice(0, 10));
  const [observacao, setObservacao] = useState("");
  const [error, setError] = useState<string | null>(null);

  const atual = historico[0];

  async function handleChange(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!situacaoId || !dataMudanca) {
      return;
    }

    const situacaoNome = situacoes.find((s) => s.id === situacaoId)?.nome ?? situacaoId;
    const ok = await confirm({
      title: "Mudar situação",
      message: `Confirma a mudança de situação para "${situacaoNome}"?`,
      confirmLabel: "Mudar situação"
    });
    if (!ok) {
      return;
    }

    try {
      await change({ situacaoId, dataMudanca, observacao: observacao || undefined });
      setSituacaoId("");
      setObservacao("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível mudar a situação.");
    }
  }

  return (
    <div className="mt-6 border-t border-zinc-200 pt-4">
      <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
        Situação do Aluno
      </h2>

      {loading ? (
        <p className="text-sm text-zinc-400">Carregando...</p>
      ) : (
        <>
          {atual && (
            <p className="mb-3 text-sm text-zinc-800">
              Situação atual: <span className="font-medium">{atual.situacao.nome}</span>
            </p>
          )}
          <ul className="mb-3 space-y-1.5">
            {historico.map((h) => (
              <li
                key={h.id}
                className="flex items-center justify-between rounded-md bg-zinc-50 px-3 py-1.5 text-sm"
              >
                <span className="font-medium text-zinc-800">{h.situacao.nome}</span>
                <span className="text-zinc-500">{formatDate(h.dataMudanca)}</span>
              </li>
            ))}
          </ul>
        </>
      )}

      <form onSubmit={handleChange} className="flex flex-wrap items-end gap-2">
        <select
          value={situacaoId}
          onChange={(e) => setSituacaoId(e.target.value)}
          className={SELECT_CLASSES}
        >
          <option value="">Nova situação</option>
          {situacoes.map((s) => (
            <option key={s.id} value={s.id}>
              {s.nome}
            </option>
          ))}
        </select>
        <input
          type="date"
          value={dataMudanca}
          onChange={(e) => setDataMudanca(e.target.value)}
          className={SELECT_CLASSES}
        />
        <input
          value={observacao}
          onChange={(e) => setObservacao(e.target.value)}
          placeholder="Observação (opcional)"
          className={SELECT_CLASSES}
        />
        <Button type="submit" variant="secondary">
          Mudar situação
        </Button>
      </form>
      {error && (
        <p role="alert" className="mt-2 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Add the "Situação" column to `AlunoList`**

In `frontend/src/modules/alunos/components/AlunoList.tsx`, add a column between `turma` and `acoes`:

```tsx
        { key: "turma", header: "Turma", render: (aluno) => aluno.turma.nome },
        { key: "situacaoAtual", header: "Situação", render: (aluno) => aluno.situacaoAtual.nome },
```

- [ ] **Step 4: Wire the panel into `AlunosPage`**

In `frontend/src/modules/alunos/pages/AlunosPage.tsx`, add the import:

```ts
import { AlunoSituacaoPanel } from "../../aluno-situacoes/components/AlunoSituacaoPanel.js";
```

Render it right after `AlunoResponsavelPanel`:

```tsx
        {editing && <AlunoResponsavelPanel alunoId={editing.id} />}
        {editing && <AlunoSituacaoPanel alunoId={editing.id} />}
```

- [ ] **Step 5: Manually verify in the browser**

Run `cd frontend && npm run dev`. Open Alunos, confirm the "Situação" column shows "Ativo" for every existing aluno. Edit an aluno, confirm the new panel shows the current situação and history, change the situação (with confirmation), and confirm the list's "Situação" column updates after closing the modal.

- [ ] **Step 6: Run the full frontend test suite**

Run: `cd frontend && npx vitest run`
Expected: PASS (no test asserted a fixed column count in `AlunoList`/`AlunosPage`, but re-check output for anything unrelated that broke).

- [ ] **Step 7: Commit**

```bash
git add frontend/src/modules/aluno-situacoes/components/AlunoSituacaoPanel.tsx frontend/src/modules/alunos
git commit -m "feat(frontend): show and change aluno situacao with history panel"
```
