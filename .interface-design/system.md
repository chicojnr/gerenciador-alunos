# GerenciadorAlunos — Design System

## Direction & feel

Admin/back-office tool for school staff managing attendance, performance, and records — used during the workday, often multitasking. Direction chosen (via visual comparison, 2026-07-10): **"Slate Moderno"** — dark neutral sidebar + indigo accent, modern SaaS-dashboard feel (Linear/Vercel register) over a warmer "institutional" or "educational" alternative. Calm, efficient, not playful.

Signature opportunity not yet built: the Faltas (attendance) phase is this product's actual domain-specific territory — a streak/grid visualization of daily presence (not a generic bar chart) belongs there. The screens built so far (Escolas, Períodos, Matérias, Usuários) are reference-data CRUD — deliberately plain, no forced signature.

## Palette

- Accent: indigo-600 `#4f46e5` / indigo-700 `#4338ca` (hover)
- Neutrals: Tailwind `zinc` scale throughout — one hue, shift lightness only
- Sidebar: `zinc-900` bg, `zinc-400` text, active item `zinc-800` bg + indigo-300 text
- Content canvas: `zinc-50` bg, cards/tables white with `zinc-200` borders
- Semantic: red-600 for destructive (danger button, error alerts), green not yet used (reserve for future status/success)
- Font: Inter, system sans fallback
- Light mode only (dark mode deferred, low-cost Tailwind retrofit later)

## Depth strategy

**Borders + subtle shadow on overlays only.** No layered elevation system yet (only one z-level in the UI besides the modal overlay). Modal panel: `shadow-xl`. Table/cards: `border-zinc-200`/`border-zinc-100`, no shadow. Revisit if a second overlay level (e.g. a popover) gets added — don't invent a new strategy ad hoc, extend this one.

## Spacing & density

Base unit 4px (Tailwind default scale). Density: comfortable-tight — table cells `px-3 py-2`, page content `p-8`, form fields `space-y-4`. Not as tight as Linear, not as airy as a marketing page — a workbench tool used all day, not a showcase.

## Type scale

No formal ratio scale yet (only one heading level in use). Established sizes: page title `text-xl font-semibold` (20px), body/table `text-sm` (14px), meta/labels `text-xs`/`text-sm text-zinc-400-500`. When a second heading level is needed (e.g. section headers within a page), step from 20px using ~1.25 ratio: 16px sub-head.

## Motion

- Modal: overlay fades in 150ms, panel fades+scales in 200ms, both `cubic-bezier(0.23,1,0.32,1)` ease-out. No exit animation (instant unmount) — acceptable for this admin-tool cadence, revisit only if it reads as jarring.
- Buttons: `active:scale-[0.97]`, 150ms ease-out, press feedback on every variant.
- Table rows: `hover:bg-zinc-50`, 150ms color transition.
- No animation on high-frequency actions (there are none yet — sidebar nav is instant, correctly).

## Component patterns

- **Button** (`shared/components/Button.tsx`) — 3 variants: `primary` (indigo solid, default), `secondary` (white/zinc-300 border), `danger` (white/red-300 border, red-600 text). `rounded-md px-3 py-1.5 text-sm font-medium`. Always gets `active:scale-[0.97]` press feedback and a `focus-visible` outline ring — never build a button without both.
- **Modal** (`shared/components/Modal.tsx`) — centered, `max-w-md`, `rounded-lg`, `p-6`, dark `bg-black/40` overlay. Used for every create/edit form across modules — don't build inline forms, always route through Modal.
- **Table** (`shared/components/Table.tsx`) — generic `Table<T>`, compact density, `Column<T>` supports an optional `render` for computed cells (used for the "Ações" column pattern: secondary Editar + danger Remover/Desativar buttons). Always renders an empty state (`"Nenhum registro encontrado."`) when `rows.length === 0` — this is automatic, don't special-case it per page.
- **CRUD module shape** (Escolas/Períodos/Matérias/Usuários all follow this): `types.ts`, `services/X.service.ts`, `hooks/useX.ts`, `components/XForm.tsx` + `XList.tsx`, `pages/XPage.tsx`. Page owns modal open/create-vs-edit state; List renders Table with an Ações render column; Form is a single component reused for both create and edit via an `initial?` prop.

## Known gaps (intentionally deferred, not forgotten)

- No skeleton loading state — plain `"Carregando..."` text. Fine for current CRUD tables (fast queries); revisit if a slower view (e.g. a dashboard with real chart queries) makes the flash-of-text feel worse.
- No dark mode.
- No responsive/mobile layout — desktop-first admin tool.
- Sidebar nav item count will grow with Cadastros (currently 4, heading toward ~10+); revisit whether flat list still works or needs grouping once Turmas/Alunos/Professores land.
