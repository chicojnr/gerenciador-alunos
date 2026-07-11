# GerenciadorAlunos — Design System

## Direction & feel

Admin/back-office tool for school staff managing attendance, performance, and records — used during the workday, often multitasking. Direction chosen (via visual comparison, 2026-07-10): **"Slate Moderno"** — dark neutral sidebar + indigo accent, modern SaaS-dashboard feel (Linear/Vercel register) over a warmer "institutional" or "educational" alternative. Calm, efficient, not playful.

Signature opportunity not yet built: the Faltas (attendance) phase is this product's actual domain-specific territory — a streak/grid visualization of daily presence (not a generic bar chart) belongs there. The screens built so far (Escolas, Períodos, Matérias, Usuários) are reference-data CRUD — deliberately plain, no forced signature.

**Revision (2026-07-11):** user flagged the first pass as "fraco, muito formal, pobre, sem ícones, sem lugar pra logo, sem animações" — a real commercial product, not an internal tool mockup. Palette/layout skeleton unchanged (still approved), but execution raised: icons (lucide-react) everywhere a control or nav item exists, a real logo mark, a real user identity chip (not a text link), page-level motion. Read this file's Icons and Motion sections before adding any new page — the bar is now "Linear/Vercel produced," not "functional CRUD."

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

## Icons

`lucide-react` — the only icon set in the project, don't mix in another. Sizing: `h-4 w-4` inline with text/buttons, `h-5 w-5` next to page-title headings, `h-3.5 w-3.5` inside compact table-row action buttons, `h-3 w-3` inside small badges. `strokeWidth={2}` default, `2.25` for small/bold marks (logo glyph, Plus in primary buttons) where 2 reads too thin at that size. One icon per nav item (`Building2` Escolas, `Clock` Períodos, `BookOpen` Matérias, `Users` Usuários) — pick the next module's icon for what it *is*, not a generic placeholder (e.g. Turmas → `Layers` or `Users2`, not another `Building2`).

## Motion

- Modal: overlay fades in 150ms, panel fades+scales in 200ms, both `cubic-bezier(0.23,1,0.32,1)` ease-out. No exit animation (instant unmount) — acceptable for this admin-tool cadence, revisit only if it reads as jarring.
- Buttons: `active:scale-[0.97]`, 150ms ease-out, press feedback on every variant.
- Table rows: `hover:bg-zinc-50`, 150ms color transition.
- Page content: fades+slides in 4px on route change (`animate-page-in`, keyed by `location.pathname` in `Layout.tsx`'s `<main>`) — 200ms, same easing as the modal. Every new page automatically gets this since it's on the `Outlet` wrapper, not per-page.
- No animation on high-frequency actions (there are none yet — sidebar nav link clicks are instant; only the resulting page content animates).

## Component patterns

- **Button** (`shared/components/Button.tsx`) — 3 variants: `primary` (indigo solid, default), `secondary` (white/zinc-300 border), `danger` (white/red-300 border, red-600 text). `rounded-md px-3 py-1.5 text-sm font-medium`. Always gets `active:scale-[0.97]` press feedback and a `focus-visible` outline ring — never build a button without both. Primary "Novo X" buttons get a leading `Plus` icon (`mr-1.5 h-4 w-4`); row-action buttons get a leading `Pencil`/`Trash2` (`mr-1.5 h-3.5 w-3.5`) — a Button with only text and no icon is the exception now, not the default.
- **Modal** (`shared/components/Modal.tsx`) — centered, `max-w-md`, `rounded-lg`, `p-6`, dark `bg-black/40` overlay. Used for every create/edit form across modules — don't build inline forms, always route through Modal.
- **Table** (`shared/components/Table.tsx`) — generic `Table<T>`, compact density, `Column<T>` supports an optional `render` for computed cells (used for the "Ações" column pattern: secondary Editar + danger Remover/Desativar buttons). Always renders an empty state (`"Nenhum registro encontrado."`) when `rows.length === 0` — this is automatic, don't special-case it per page.
- **Badge** (inline pattern, not yet extracted to a component — extract if a 3rd variant appears) — `inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium`. Used for the Usuários role column: `bg-indigo-50 text-indigo-700` + `ShieldCheck` icon for Admin, `bg-zinc-100 text-zinc-600` plain for Usuário. Reach for this instead of plain text whenever a column value is a fixed enum/status.
- **Page header** — every page's header row: `<Icon className="h-5 w-5 text-zinc-400" /> <h1 className="text-xl font-semibold text-zinc-900">Title</h1>` on the left, primary `Button` with a `Plus` icon on the right, both inside `mb-6 flex items-center justify-between`. The icon matches that module's sidebar nav icon.
- **Sidebar identity chip** (`core/Layout.tsx`, footer) — gradient (`from-indigo-500 to-indigo-700`) circular avatar with the user's initials (derived from `name`, first letter of first two words), name + role label next to it, ghost `LogOut` icon-button on the right. Replaces any plain "Sair" text link — this is the pattern for showing "who's logged in," not a dropdown menu (not built yet).
- **CRUD module shape** (Escolas/Períodos/Matérias/Usuários all follow this): `types.ts`, `services/X.service.ts`, `hooks/useX.ts`, `components/XForm.tsx` + `XList.tsx`, `pages/XPage.tsx`. Page owns modal open/create-vs-edit state; List renders Table with an Ações render column; Form is a single component reused for both create and edit via an `initial?` prop.

## Known gaps (intentionally deferred, not forgotten)

- No skeleton loading state — plain `"Carregando..."` text. Fine for current CRUD tables (fast queries); revisit if a slower view (e.g. a dashboard with real chart queries) makes the flash-of-text feel worse.
- No dark mode.
- No responsive/mobile layout — desktop-first admin tool.
- Sidebar nav item count will grow with Cadastros (currently 4, heading toward ~10+); revisit whether flat list still works or needs grouping once Turmas/Alunos/Professores land.
