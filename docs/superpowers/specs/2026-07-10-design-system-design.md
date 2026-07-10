# Design System — Design Spec

**Date**: 2026-07-10
**Scope**: Frontend visual foundation — applies retroactively to Escolas (Foundation phase) and forward to every Cadastros module.

## Context

The Foundation phase shipped functional but visually bare UI (unstyled HTML elements). Before building the Cadastros phase (7+ more entities, each with a page), we establish a consistent visual language once, so every future module inherits it instead of each one needing its own styling pass.

## Decisions

### Stack

- **Tailwind CSS** in the `frontend/` package only (backend doesn't need it).
- No component library (shadcn/Mantine/Chakra) — custom components styled with Tailwind utility classes, consistent with the Foundation phase's "own everything, no framework dependency" approach.

### Palette

- **Accent**: indigo `#4f46e5` (Tailwind `indigo-600`) — primary actions, links, active nav state.
- **Neutrals**: Tailwind's `zinc` scale (`zinc-50` through `zinc-900`).
- **Sidebar**: `zinc-900` background, `zinc-400` text, active item gets `zinc-800` background + light indigo text.
- **Content background**: `zinc-50`; cards/tables white with `zinc-200` borders.
- **Font**: Inter, system sans-serif fallback.
- **Light mode only** for this phase — dark mode deferred, Tailwind makes it a low-cost retrofit later.

### Layout

- `Layout.tsx` restructured: fixed-width (~240px) left sidebar, not collapsible yet (not a priority).
- Sidebar: system name/logo at top, nav item list below (starts with just "Escolas", grows as Cadastros modules land), logged-in user name + logout button pinned to the bottom.
- Content area: right of sidebar, comfortable padding, simple header (page title + primary action button).
- Active nav item highlighted; inactive items get a subtle hover state.

### Shared components (retrofit, same props API)

- **`Button`**: `variant` prop — `primary` (solid indigo, default), `secondary` (white, gray border), `danger` (red, for destructive actions).
- **`Modal`**: dark overlay (`bg-black/40`), centered white panel, shadow, rounded corners, close button in the corner.
- **`Table`**: compact density (confirmed via visual comparison — more rows visible per screen, appropriate for lists that will grow to hundreds of students/attendance records), light-gray sticky header, subtle row hover. No zebra striping needed yet.
- Form inputs get consistent styling: `zinc-300` border, indigo focus ring.

### EscolasPage as the reference application

- Header: "Escolas" title + "Nova Escola" button (primary), aligned in one row.
- Table: compact, adds an "Ações" column with Edit (secondary) / Remove (danger) buttons per row, replacing the current below-table button stack.
- Create/edit modal: restyled with the new Modal/Button/input treatment, no functional change.

## Out of scope

- Dark mode.
- Responsive/mobile layout (desktop-first, admin tool).
- Collapsible sidebar.
- Any change to backend code, API contracts, or data model.
- Styling for modules beyond Escolas (Cadastros modules will consume this system as they're built, not styled individually here).
