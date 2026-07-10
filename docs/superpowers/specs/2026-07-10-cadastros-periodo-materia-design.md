# Cadastros — Período + Matéria — Design Spec

**Date**: 2026-07-10
**Phase**: First Cadastros sub-phase — see "Roadmap" below.

## Context

The Foundation phase proved the `routes → service → repository → Prisma` pattern with Escolas. The Design System phase established the frontend visual language. This sub-phase adds the two simplest standalone Cadastros entities — Período (turno: Diurno, Noturno, etc.) and Matéria (subject, global across the system) — by cloning the Escolas pattern exactly, now consuming the Design System components from the start instead of retrofitting them later.

Período and Matéria have no relationships to other entities yet (Turma will reference Período later; TurmaMateria will reference Matéria later — both out of scope here).

## Roadmap (Cadastros phase, for context — not part of this spec)

1. **Período + Matéria** (this spec) — simplest standalone entities
2. **Professor + Turma** — Professor belongs to one Escola; Turma belongs to Escola + Período
3. **TurmaMateria (grade horária) + Aluno** — links Turma+Matéria+Professor; Aluno belongs to Turma
4. **Responsável** — N:N with Aluno via join table
5. **CalendárioLetivo + ResponsávelComunicação** — both belong to Escola
6. **Planilha import** — bulk-import Alunos from spreadsheet

Each sub-phase gets its own spec + plan + implementation cycle, same as this one.

## Data model

Identical shape for both entities — simple named, soft-deletable, uniquely-named records:

```prisma
model Periodo {
  id        String   @id @default(uuid())
  nome      String   @unique
  ativo     Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Materia {
  id        String   @id @default(uuid())
  nome      String   @unique
  ativo     Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

`nome` is unique (confirmed decision — prevents accidental duplicate registration, e.g. two "Diurno" rows).

## Backend

Two independent modules, each an exact clone of `modules/escolas/`'s shape:

- `backend/src/modules/periodos/{periodos.routes,periodos.service,periodos.repository,periodos.types}.ts` — `PeriodoNotFoundError`, `PeriodoValidationError`, soft delete via `ativo=false`, endpoints `GET/GET:id/POST/PUT/DELETE /periodos`, all behind `requireAuth`.
- `backend/src/modules/materias/{materias.routes,materias.service,materias.repository,materias.types}.ts` — same shape, `Materia`/`materias` naming, endpoints under `/materias`.

Both registered in `app.ts` alongside the existing Escolas registration.

## Frontend

Two independent modules, each cloning `modules/escolas/`'s shape and consuming the Design System (Task 1-6 of the Design System plan) from the start — no retrofit needed:

- `frontend/src/modules/periodos/{types,services/periodos.service,hooks/usePeriodos,components/PeriodoForm,components/PeriodoList,pages/PeriodosPage}` — table + create/edit modal, same UX as Escolas.
- `frontend/src/modules/materias/` — same shape for Matéria.

Sidebar (`Layout.tsx`) gains two new nav items: "Períodos" and "Matérias".

## Out of scope

- Any relationship to Turma/Professor (Período) or TurmaMateria (Matéria) — those land in later sub-phases when Turma/TurmaMateria are built.
- Any change to Escolas, auth, or the Design System components themselves.
