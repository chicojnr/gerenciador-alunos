# Roles & Users — Design Spec

**Date**: 2026-07-10
**Scope**: Introduces role-based access control (Admin vs. User), retroactively gates the Escolas module to Admin-only, and adds an Admin-only Usuários management screen.

## Context

The Foundation design spec explicitly chose no roles/permissions: "usuário logado tem permissão em todos os módulos." That decision is now revised: Escolas (the school registry itself) must be Admin-only — regular users manage all other cadastros (Turmas, Professores, Matérias, Períodos, and future entities) but never create/edit/delete schools. Admin also needs a screen to create and manage other users, since there's currently no way to add a second user beyond the seed script.

This sub-phase must land before Professor/Turma (the next Cadastros sub-phase) so those modules are built against a role model that already exists, not retrofitted later.

## Data model

```prisma
enum Role {
  ADMIN
  USER
}

model User {
  id           String   @id @default(uuid())
  email        String   @unique
  passwordHash String
  name         String
  role         Role     @default(USER)
  ativo        Boolean  @default(true)
  createdAt    DateTime @default(now())
}
```

- `role` defaults to `USER` (safe default — creating a user without specifying a role never grants Admin).
- `ativo` is new — deactivating a user is a soft delete (`ativo=false`), consistent with every other entity in this system. Deactivated users must be rejected at login and by `requireAuth`, even with a still-valid JWT (see Auth section).
- A data migration sets the existing seeded admin's `role` to `ADMIN` (identified by `ADMIN_SEED_EMAIL`).

## Auth changes

- JWT access token payload gains `role` (alongside the existing `userId`), so role checks don't need a DB lookup on every request. Refresh tokens keep just `userId` — refreshing re-issues an access token by looking up the current user (so a role change or deactivation takes effect on the next refresh, not just at next login).
- `requireAuth` additionally verifies the user is still `ativo` — this DOES require a DB lookup (one `findUnique` per request), trading a small perf cost for deactivation taking effect immediately rather than waiting for token expiry. This is a deliberate change from the Foundation version, which only verified the JWT signature.
- New `requireRole(role: Role)` preHandler, composed after `requireAuth`: reads `request.user.role` (set by `requireAuth`) and returns 403 if it doesn't match.

## Escolas — retroactive gate

All 5 existing Escolas routes (`GET/GET:id/POST/PUT/DELETE /escolas`) get `requireRole("ADMIN")` added to their `preHandler` chain, alongside the existing `requireAuth`. Read access is included in the gate — regular users cannot view the Escolas list either, per the confirmed requirement.

## Usuários module (new, Admin-only)

Full CRUD, all routes gated `requireRole("ADMIN")`:

- Create: name, email, initial password (hashed), role.
- Edit: name, role (email and password not editable in this phase — no "forgot password" flow, no self-service).
- Deactivate: soft delete via `ativo=false` (never hard-delete — consistent with the rest of the system, and a deactivated user's historical actions/records stay attributable).
- List: table showing name, email, role, status (ativo/inativo).

Frontend: `UsuariosPage`, only reachable/visible in the sidebar for Admins (regular users don't see the nav item). Reuses the Table/Modal/Button design system components.

## Other Cadastros modules — unaffected

Turmas, Professores, Matérias, Períodos (existing and future) get no role gate — any authenticated, active user (Admin or User) has full access, matching the original "any logged-in user" model for everything except Escolas and Usuários.

## Out of scope

- Self-service password change or reset.
- Any role beyond ADMIN/USER (no per-module fine-grained permissions).
- Retroactive role gating on Turmas/Professores/Matérias/Períodos — confirmed open to both roles.
