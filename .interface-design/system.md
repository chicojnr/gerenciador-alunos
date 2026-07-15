# GerenciadorAlunos — Design System

## Direction & feel

Admin/back-office tool for school staff managing attendance, performance, and records — used during the workday, often multitasking.

**Revision (2026-07-14):** user flagged the whole project as "muito simples" (Matérias table specifically). Pivoted away from the 2026-07-10/11 "Slate Moderno" direction (dark neutral sidebar + generic indigo-600 SaaS accent) to **"Ficha Escolar"** — a school-ledger/register feel: warm paper neutrals instead of cool zinc-gray, a petróleo ink-blue accent instead of stock indigo, and a monospace signature for codes (disciplina/matrícula) rendered as a "ficha" chip. Rationale: this is a Brazilian public-school secretaria system (conselho de classe, mapão, código de disciplina) — the palette should come from that world, not a generic dashboard template. Approved via rendered artifact comparison before implementation.

The **Icons**, **Motion**, **Component patterns**, and **CRUD module shape** sections below (established 2026-07-10/11) still hold — only the palette/type/depth tokens changed. Read this whole file before adding any new page.

Signature opportunity not yet built: the Faltas (attendance) phase is this product's actual domain-specific territory — a streak/grid visualization of daily presence (not a generic bar chart) belongs there.

## Palette

Applied by overriding Tailwind's `zinc`/`indigo`/`red`/`emerald` scales in `frontend/tailwind.config.js` — every existing `bg-zinc-*`, `text-indigo-*`, `border-red-*` etc. across the whole codebase inherits automatically, no per-file class renames needed.

- `zinc-50` `#faf6ee` papel (page/canvas background — was cool `#fafafa`-ish)
- `zinc-100` `#f2ece0` ficha (table header bg, secondary surface)
- `zinc-200` `#e6ddc8` border
- `zinc-300` `#d6c9ac` border (inputs, secondary buttons)
- `zinc-400` `#b4a886` icon/tertiary text
- `zinc-500` `#8a8265` muted text
- `zinc-600` `#6b6449` secondary text
- `zinc-900` `#221c11` grafite (primary text — was cool near-black)
- `indigo-600` `#2c4a5e` tinta (primary accent — buttons, links, focus ring; was `#4f46e5`)
- `indigo-700` `#1d3441` accent hover
- `indigo-50` `#eaf0f3` accent-soft (row hover, badges)
- `red-600` `#9a4630` carimbo/danger (was stock red `#dc2626`-ish)
- `emerald-600` `#3f6b4e` aprovado/success (was stock emerald)
- Sidebar unchanged in structure: dark neutral bg, now grafite-tinted (`zinc-900` under the new warm ramp) rather than cool slate.

## Palette (superseded reference — 2026-07-10/11 "Slate Moderno")

Kept for history only, do not reuse: indigo-600 `#4f46e5`, cool `zinc` default scale, Inter font. Fully replaced above.

## Depth strategy

Subtle shadows, not borders-only. Table/cards: `shadow-[0_1px_2px_rgba(34,28,17,0.05),0_2px_6px_rgba(34,28,17,0.04)]` (warm-tinted, not pure black). Modal panel: `shadow-xl`. Primary button gets its own slightly stronger shadow (see Button.tsx). Still one z-level besides the modal overlay — extend this strategy, don't invent a new one, if a popover/dropdown level gets added.

## Spacing & density

Base unit 4px (Tailwind default scale). Density: comfortable-tight — page content `p-8`, form fields `space-y-4`. Table: header `th` is `px-3 py-1.5`, body `td` is `px-3 py-0.5` — **header padding is deliberately taller than body** (landed 2026-07-14 after a few passes) so the label row reads as the anchor while data rows stay ledger-tight. Base text `text-[13px]`, body cells use the `Table` default (no custom weight/color per-column — see Component patterns).

## Type scale

- `font-sans`: **IBM Plex Sans** (was Inter) — interface, titles, body. Loaded via Google Fonts in `frontend/index.html`.
- `font-mono`: **IBM Plex Mono** (new) — codes, tabular/numeric data. This is the signature typeface pairing: mono for anything that's a system code (código de disciplina, matrícula), sans for everything else.
- Page title `text-xl font-semibold` (20px), body/table `text-sm` (14px), meta/labels `text-xs`/`text-sm text-zinc-400-500`. Table headers are `text-[11px] font-semibold uppercase tracking-wide text-zinc-500` (ledger-register feel — this is new, was plain `font-medium text-zinc-600` non-uppercase).

## Icons

`lucide-react` — the only icon set in the project, don't mix in another. Sizing: `h-4 w-4` inline with text/buttons, `h-5 w-5` next to page-title headings, `h-3.5 w-3.5` inside compact table-row action buttons, `h-3 w-3` inside small badges. `strokeWidth={2}` default, `2.25` for small/bold marks (logo glyph, Plus in primary buttons). One icon per nav item, matching what the module *is* (e.g. Turmas → `Layers`, not another generic icon).

## Motion

- Modal: overlay fades in 150ms, panel fades+scales in 200ms, both `cubic-bezier(0.23,1,0.32,1)` ease-out. No exit animation.
- Buttons: `active:scale-[0.97]`, 150ms ease-out, press feedback on every variant.
- Table rows: `hover:bg-indigo-50/60` (was `hover:bg-zinc-50` — now uses the accent-soft tint instead of a neutral), 150ms color transition.
- Page content: fades+slides in 4px on route change (`animate-page-in`, keyed by `location.pathname` in `Layout.tsx`'s `<main>`) — 200ms, same easing as the modal.
- No animation on high-frequency actions.

## Component patterns

- **Button** (`shared/components/Button.tsx`) — 3 variants: `primary` (accent solid + subtle shadow, default), `secondary` (white/zinc-300 border), `danger` (white/red-300 border, red-600 text). `rounded-md px-3 py-1.5 text-sm font-medium`. Always `active:scale-[0.97]` + `focus-visible` ring. Primary "Novo X" buttons get a leading `Plus` icon; row-action buttons get leading `Pencil`/`Trash2`.
- **Modal** (`shared/components/Modal.tsx`) — centered, `rounded-lg`, `p-6`, dark `bg-black/40` overlay. `size` prop (`"md"` default `max-w-md`, `"lg"` `max-w-3xl`) for content wider than a simple form. **No built-in close affordance** (2026-07-14: removed the `×` corner button project-wide) — the only way to close is an explicit button in the modal's own content (a form's Cancelar, `ConfirmDialog`'s Cancelar, `AuthExpiredModal`'s OK). `onClose` stays in the props/type for API stability and is what those buttons call, but `Modal` itself no longer invokes it. Every create/edit `*Form` component takes an `onCancel: () => void` prop and renders a `secondary` "Cancelar" button next to the submit button (`<div className="flex gap-2">`); the owning `*Page` wires it to `() => setModalOpen(false)`. Applied across all 14 form components and every multi-step custom modal (`MateriaImportModal`, `EnviarMensagemModal`) — any new modal must follow the same rule, don't reintroduce a corner close button.
- **Table** (`shared/components/Table.tsx`) — generic `Table<T>`, compact density. Header row is uppercase-tracked ledger style over `bg-zinc-100`. **Rows need an explicit `bg-white` on `<tr>`** (hover overrides it with `hover:bg-indigo-50/60`) — don't leave rows transparent, they'll inherit the page canvas (`bg-zinc-50`) which is close enough in the warm palette that the table visually disappears into the background (hit this exact bug 2026-07-14, user: "a tabela está se misturando com o fundo"). Canvas vs. surface must stay visually distinct. Last-row bottom border removed via `group` on `<tr>` + `group-last:border-b-0` on `<td>`. Always renders the `"Nenhum registro encontrado."` empty state.
- **Código column** — no chip/badge box (tried a boxed `CodeChip` 2026-07-14, user rejected it as too much emphasis — removed the component). Also tried muted `font-mono text-zinc-500`, then `font-medium text-zinc-800`, to differentiate/match the name column — user rejected any styling at all on body rows: **no custom `render` for either column**, just the `Table` default cell rendering (plain `text-zinc-700`, no font-weight). Body text should stay visually quiet; the header (uppercase+tracking) is the only place weight/emphasis lives in a table. Código column comes **before** the name column (código is the identifying/scannable field in this domain) — same order in `MateriaForm`'s field order.
- **Button `size` prop** (new) — `"md"` (default, `px-3 py-1.5 text-sm`) for page-level actions (header buttons like "Nova Disciplina"); `"sm"` (`px-2 py-1 text-xs`) for compact contexts like table row actions. Table row Editar/Remover use `size="sm"` with smaller icons (`h-3 w-3`, `mr-1`) — don't shrink the global default, add the variant instead.
- **Ações column** — action buttons are right-aligned flush to the table's right edge (`flex justify-end gap-2` in the column's `render`), not left-aligned within the cell. This is a per-list-component choice (the `render` function), not something `Table` enforces — repeat it in every list's Ações column.
- **Row edit via clickable text, not an Editar button** — shared `ClickableCell` (`shared/components/ClickableCell.tsx`): `<button type="button">` reset to look like plain text, `hover:text-indigo-600 hover:underline`, calls `onEdit`. Applied 2026-07-14 to **all 14 list components** (not just Matérias — user explicitly asked for it everywhere): the entity's own identifying column (`nome`/`name`/`user.name`, whichever is the primary label — never a nested relation's name like `escola.nome`) is the clickable one. Ações column keeps only the destructive action, `size="sm"`, right-aligned (`flex justify-end gap-2`). `DiaNaoLetivoList` has no edit at all (create-only entity) so no `ClickableCell` there, just the sized/aligned Remover. New list components must follow this — no Editar button, ever.
- **Badge** (inline pattern, not yet extracted — extract if a 3rd variant appears) — `inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium`. Used for Usuários role column (`bg-indigo-50 text-indigo-700` + `ShieldCheck` for Admin, `bg-zinc-100 text-zinc-600` plain for Usuário).
- **Page header** — `<Icon className="h-5 w-5 text-zinc-400" /> <h1 className="text-xl font-semibold text-zinc-900">Title</h1>` on the left, primary `Button` with `Plus` on the right, inside `mb-6 flex items-center justify-between`. Matérias also has a secondary "Importar" button next to the primary one — the pattern for a page with more than one top-level action: primary last (rightmost), secondary(s) to its left, same row.
- **Sidebar identity chip** (`core/Layout.tsx`, footer) — gradient circular avatar with initials, name + role label, ghost `LogOut` icon-button.
- **Form field label** — small label above each input (`mb-1 block text-xs font-medium text-zinc-600`, matching `auth/LoginPage.tsx`'s existing pattern), placeholder stays as in-field hint text, not a label replacement. Applied to `MateriaForm` 2026-07-14; other module forms (`ProfessorForm`, `TurmaForm`, etc.) still only use placeholders — extend this pattern to them if asked, don't assume it's already everywhere.
- **CRUD module shape** (Escolas/Períodos/Matérias/Usuários/…): `types.ts`, `services/X.service.ts`, `hooks/useX.ts`, `components/XForm.tsx` + `XList.tsx`, `pages/XPage.tsx`. Page owns modal open/create-vs-edit state; List renders Table with an Ações render column; Form is reused for create+edit via `initial?`.
- **Session-expiry modal** (`auth/AuthExpiredModal.tsx`, new) — mounted once in `Layout.tsx`. Any API call that gets a 401 (after a failed silent refresh) outside the auth endpoints themselves triggers this globally via `auth/authExpired.ts`'s pub/sub, instead of each component showing its own inline "not authenticated" error text. OK clears local session state and redirects to `/login`.

## Known gaps (intentionally deferred, not forgotten)

- No skeleton loading state — plain `"Carregando..."` text.
- No dark mode — single warm-paper theme by design, not an omission to fix later; revisit only if the user asks for one.
- No responsive/mobile layout — desktop-first admin tool.
- Sidebar nav item count has grown past the original ~10 estimate; still a flat list — revisit grouping if it keeps growing.
- "Matéria" as a user-facing word was renamed to "Disciplina" everywhere (nav, page title, buttons, form, confirm dialogs, import modal, backend error messages, Dashboard/Desempenho/Turma-Matéria references) on 2026-07-14. Internal identifiers were deliberately left alone (module folder `materias`, route `/materias`, Prisma model `Materia`, `MateriaService`/`MateriaValidationError` etc., DB column names) — this was a copy-only rename, not a domain-model rename. Keep new user-facing strings consistent with "Disciplina"; don't reintroduce "Matéria" in anything the user reads.
