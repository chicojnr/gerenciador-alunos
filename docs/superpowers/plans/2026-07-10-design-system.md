# Design System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apply a consistent Tailwind-based visual language (indigo/zinc palette, sidebar layout, compact tables) to the frontend, retrofitting the existing Escolas module as the reference application.

**Architecture:** Tailwind CSS utility classes applied directly to existing components — no new abstraction layer, no component library. `Table` gains an optional per-column `render` function so callers can put arbitrary content (like action buttons) in a cell instead of a raw stringified value.

**Tech Stack:** Tailwind CSS 3, PostCSS, Autoprefixer, Google Fonts (Inter).

## Global Constraints

- Light mode only — no dark mode in this phase.
- No backend changes, no API contract changes.
- `Button`/`Modal`/`Table` keep their existing prop APIs backward-compatible — only additive changes (new optional props), so no other call site breaks.
- Desktop-first, no responsive/mobile work.
- The sidebar shows a "Sair" (logout) action but NOT a personalized user name — `AuthContext`'s `user` only carries `{ id }` (from `GET /auth/me`), and adding a display name would require a backend change, which is out of scope per the approved design spec.

---

## File Structure

```
frontend/
├── tailwind.config.js         # new
├── postcss.config.js          # new
├── package.json                # modified — add tailwindcss/postcss/autoprefixer
├── index.html                  # modified — Inter font link
└── src/
    ├── index.css                # new — Tailwind directives
    ├── main.tsx                 # modified — import ./index.css
    ├── core/
    │   └── Layout.tsx           # modified — sidebar
    ├── shared/components/
    │   ├── Button.tsx           # modified — variant prop
    │   ├── Modal.tsx            # modified — overlay/panel styling
    │   └── Table.tsx            # modified — compact styling + render support
    └── modules/escolas/
        ├── components/
        │   ├── EscolaForm.tsx    # modified — input/error styling
        │   └── EscolaList.tsx    # modified — actions column via Table render
        └── pages/
            └── EscolasPage.tsx   # modified — header layout
```

---

### Task 1: Tailwind setup

**Files:**
- Create: `frontend/tailwind.config.js`
- Create: `frontend/postcss.config.js`
- Create: `frontend/src/index.css`
- Modify: `frontend/src/main.tsx`
- Modify: `frontend/index.html`
- Modify: `frontend/package.json`

**Interfaces:**
- Produces: Tailwind utility classes available to every component under `frontend/src/**/*.{ts,tsx}` via `frontend/src/index.css`, imported once in `main.tsx`. Consumed by every later task in this plan.

- [ ] **Step 1: Add Tailwind devDependencies to `frontend/package.json`**

Add to `devDependencies` (keep all existing entries unchanged):

```json
    "autoprefixer": "^10.4.20",
    "postcss": "^8.4.41",
    "tailwindcss": "^3.4.10"
```

- [ ] **Step 2: Create `frontend/tailwind.config.js`**

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        indigo: {
          600: "#4f46e5",
          700: "#4338ca"
        }
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"]
      }
    }
  },
  plugins: []
};
```

- [ ] **Step 3: Create `frontend/postcss.config.js`**

```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {}
  }
};
```

- [ ] **Step 4: Create `frontend/src/index.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  font-family: "Inter", system-ui, sans-serif;
}
```

- [ ] **Step 5: Import the stylesheet in `frontend/src/main.tsx`**

Modify `frontend/src/main.tsx` — add the import as the first line:

```typescript
import "./index.css";
import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./App.js";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

- [ ] **Step 6: Add the Inter font link to `frontend/index.html`**

Modify `frontend/index.html` — add inside `<head>`, after the `<title>` line:

```html
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
      rel="stylesheet"
    />
```

- [ ] **Step 7: Install dependencies**

Run: `pnpm install`
Expected: `tailwindcss`, `postcss`, `autoprefixer` added to `frontend/node_modules`, lockfile updated.

- [ ] **Step 8: Verify the dev server picks up Tailwind**

Run: `pnpm --filter frontend dev` (background), then check the terminal output for no PostCSS/Tailwind errors. Stop the dev server after checking.

- [ ] **Step 9: Commit**

```bash
git add frontend/package.json frontend/tailwind.config.js frontend/postcss.config.js frontend/src/index.css frontend/src/main.tsx frontend/index.html pnpm-lock.yaml
git commit -m "feat(frontend): add Tailwind CSS and Inter font"
```

---

### Task 2: Button component — variants

**Files:**
- Modify: `frontend/src/shared/components/Button.tsx`

**Interfaces:**
- Consumes: Tailwind classes (Task 1).
- Produces: `Button({ variant?: "primary" | "secondary" | "danger", ...ButtonHTMLAttributes })` — `variant` defaults to `"primary"`. Backward compatible: existing callers passing no `variant` get the same visual role (primary) as before. Consumed by Task 6 (`EscolaList`, `EscolaForm`, `EscolasPage`).

- [ ] **Step 1: Replace `frontend/src/shared/components/Button.tsx`**

```tsx
import { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "danger";

const VARIANT_CLASSES: Record<Variant, string> = {
  primary: "bg-indigo-600 text-white hover:bg-indigo-700 focus-visible:outline-indigo-600",
  secondary:
    "bg-white text-zinc-700 border border-zinc-300 hover:bg-zinc-50 focus-visible:outline-zinc-400",
  danger:
    "bg-white text-red-600 border border-red-300 hover:bg-red-50 focus-visible:outline-red-500"
};

const BASE_CLASSES =
  "inline-flex items-center justify-center rounded-md px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50 disabled:pointer-events-none";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

export function Button({ variant = "primary", className, ...props }: ButtonProps) {
  const classes = [BASE_CLASSES, VARIANT_CLASSES[variant], className].filter(Boolean).join(" ");
  return <button className={classes} {...props} />;
}
```

- [ ] **Step 2: Run the frontend test suite**

Run: `pnpm --filter frontend test`
Expected: all existing tests still pass — no test asserts on `Button`'s exact class list, only on text content and click behavior.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/shared/components/Button.tsx
git commit -m "feat(frontend): add Button variants (primary/secondary/danger)"
```

---

### Task 3: Modal component — overlay and panel styling

**Files:**
- Modify: `frontend/src/shared/components/Modal.tsx`

**Interfaces:**
- Consumes: Tailwind classes (Task 1).
- Produces: same `Modal({ open, onClose, children })` API as before — visual-only change. `role="dialog"` stays on the same logical element (an inner panel div) so existing `queryByRole("dialog")` assertions in `EscolasPage.test.tsx` keep working.

- [ ] **Step 1: Replace `frontend/src/shared/components/Modal.tsx`**

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div role="dialog" aria-modal="true" className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <div className="mb-2 flex justify-end">
          <button
            aria-label="Fechar"
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-600"
          >
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Run the frontend test suite**

Run: `pnpm --filter frontend test`
Expected: all pass, including `EscolasPage.test.tsx`'s `queryByRole("dialog")` assertions.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/shared/components/Modal.tsx
git commit -m "feat(frontend): style Modal overlay and panel"
```

---

### Task 4: Table component — compact styling and render support

**Files:**
- Modify: `frontend/src/shared/components/Table.tsx`

**Interfaces:**
- Consumes: Tailwind classes (Task 1).
- Produces: `Column<T>` gains an optional `render?: (row: T) => ReactNode` and `key` is widened to `keyof T | string` (so a pseudo-column like `"acoes"` that has no matching field can be used purely for its `render` function). When `render` is provided it's used instead of `String(row[key])`. Backward compatible — existing columns without `render` behave identically. Consumed by Task 6 (`EscolaList`'s new "Ações" column).

- [ ] **Step 1: Replace `frontend/src/shared/components/Table.tsx`**

```tsx
import { ReactNode } from "react";

interface Column<T> {
  key: keyof T | string;
  header: string;
  render?: (row: T) => ReactNode;
}

interface TableProps<T> {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
}

export function Table<T>({ columns, rows, rowKey }: TableProps<T>) {
  return (
    <table className="w-full border-separate border-spacing-0 overflow-hidden rounded-lg border border-zinc-200 text-sm">
      <thead className="bg-zinc-50">
        <tr>
          {columns.map((col) => (
            <th
              key={String(col.key)}
              className="border-b border-zinc-200 px-3 py-2 text-left font-medium text-zinc-600"
            >
              {col.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={rowKey(row)} className="hover:bg-zinc-50">
            {columns.map((col) => (
              <td key={String(col.key)} className="border-b border-zinc-100 px-3 py-2 text-zinc-800">
                {col.render ? col.render(row) : String(row[col.key as keyof T])}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

- [ ] **Step 2: Run the frontend test suite**

Run: `pnpm --filter frontend test`
Expected: `Table.test.tsx` still passes (its one column, `{ key: "nome", header: "Nome" }`, has no `render`, uses the fallback stringify path unchanged).

- [ ] **Step 3: Commit**

```bash
git add frontend/src/shared/components/Table.tsx
git commit -m "feat(frontend): compact Table styling and per-column render support"
```

---

### Task 5: Layout — sidebar

**Files:**
- Modify: `frontend/src/core/Layout.tsx`

**Interfaces:**
- Consumes: `useAuth()` (for `logout`) from `../auth/AuthContext.js`, Tailwind classes (Task 1).
- Produces: same `Layout` export consumed by `router.tsx` — no signature change, visual restructure only.

- [ ] **Step 1: Replace `frontend/src/core/Layout.tsx`**

```tsx
import { Outlet, Link, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.js";

const NAV_ITEMS = [{ to: "/escolas", label: "Escolas" }];

export function Layout() {
  const location = useLocation();
  const { logout } = useAuth();

  return (
    <div className="flex min-h-screen bg-zinc-50">
      <aside className="flex w-60 flex-col bg-zinc-900 text-zinc-400">
        <div className="px-4 py-5 text-lg font-semibold text-white">GerenciadorAlunos</div>
        <nav className="flex-1 space-y-1 px-2">
          {NAV_ITEMS.map((item) => {
            const active = location.pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={
                  "block rounded-md px-3 py-2 text-sm font-medium " +
                  (active
                    ? "bg-zinc-800 text-indigo-300"
                    : "hover:bg-zinc-800/60 hover:text-zinc-200")
                }
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-zinc-800 px-4 py-4">
          <button onClick={() => logout()} className="text-sm font-medium hover:text-white">
            Sair
          </button>
        </div>
      </aside>
      <main className="flex-1 p-8">
        <Outlet />
      </main>
    </div>
  );
}
```

- [ ] **Step 2: Run the frontend test suite**

Run: `pnpm --filter frontend test`
Expected: all pass — no test directly renders `Layout` in isolation (it's exercised through `router.tsx`, not unit-tested), so this step is a sanity check that nothing else broke.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/core/Layout.tsx
git commit -m "feat(frontend): sidebar layout"
```

---

### Task 6: Escolas module — apply the design system

**Files:**
- Modify: `frontend/src/modules/escolas/components/EscolaList.tsx`
- Modify: `frontend/src/modules/escolas/components/EscolaForm.tsx`
- Modify: `frontend/src/modules/escolas/pages/EscolasPage.tsx`

**Interfaces:**
- Consumes: `Button` variants (Task 2), `Table` render support (Task 4), `Modal` (Task 3).
- Produces: no prop-signature changes to `EscolaList`, `EscolaForm`, or `EscolasPage` — visual-only. Existing tests (`EscolaList.test.tsx`, `EscolaForm.test.tsx`, `EscolasPage.test.tsx`) must keep passing unmodified, since they assert on text content and callback arguments, not DOM structure or classes.

- [ ] **Step 1: Replace `frontend/src/modules/escolas/components/EscolaList.tsx`**

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
    <Table<Escola>
      columns={[
        { key: "nome", header: "Nome" },
        {
          key: "acoes",
          header: "Ações",
          render: (escola) => (
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => onEdit(escola)}>
                Editar
              </Button>
              <Button variant="danger" onClick={() => onRemove(escola.id)}>
                Remover
              </Button>
            </div>
          )
        }
      ]}
      rows={escolas}
      rowKey={(e) => e.id}
    />
  );
}
```

- [ ] **Step 2: Replace `frontend/src/modules/escolas/components/EscolaForm.tsx`**

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
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await onSubmit({ nome });
      if (!initial) {
        setNome("");
      }
    } catch {
      setError("Não foi possível salvar a escola. Tente novamente.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        placeholder="Nome da escola"
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

- [ ] **Step 3: Replace `frontend/src/modules/escolas/pages/EscolasPage.tsx`**

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
    return <p className="text-zinc-500">Carregando...</p>;
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
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-zinc-900">Escolas</h1>
        <Button onClick={openCreate}>Nova Escola</Button>
      </div>
      <EscolaList escolas={escolas} onEdit={openEdit} onRemove={remove} />
      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <EscolaForm
          initial={editing ? { nome: editing.nome } : undefined}
          submitLabel={editing ? "Salvar" : "Adicionar"}
          onSubmit={handleSubmit}
        />
      </Modal>
    </div>
  );
}
```

- [ ] **Step 4: Run the full frontend test suite**

Run: `pnpm --filter frontend test`
Expected: all tests pass, including `EscolaList.test.tsx` (asserts `onEdit`/`onRemove` called with correct args — unaffected by the new `Button variant` props or the `render`-based column), `EscolaForm.test.tsx`, `EscolasPage.test.tsx`.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/modules/escolas/components/EscolaList.tsx frontend/src/modules/escolas/components/EscolaForm.tsx frontend/src/modules/escolas/pages/EscolasPage.tsx
git commit -m "feat(frontend): apply design system to Escolas module"
```

---

### Task 7: Final verification

**Files:** none created — this task only runs and verifies existing pieces together.

**Interfaces:** none produced — terminal task of the plan.

- [ ] **Step 1: Run the full frontend test suite**

Run: `pnpm --filter frontend test`
Expected: all suites pass (no regressions from any of Tasks 1-6).

- [ ] **Step 2: Type-check**

Run: `pnpm --filter frontend exec tsc --noEmit`
Expected: zero errors.

- [ ] **Step 3: Build**

Run: `pnpm --filter frontend build`
Expected: succeeds, `frontend/dist` emitted, no Tailwind/PostCSS warnings in the output.

- [ ] **Step 4: Visual check**

Start both dev servers (`pnpm --filter backend dev`, `pnpm --filter frontend dev`), open `http://localhost:5173`, log in, and confirm: sidebar renders with the indigo/zinc palette, Escolas table is compact with an Ações column showing Editar (gray outline) / Remover (red outline) buttons, "Nova Escola" opens a styled modal, Inter font is visibly applied (not the browser default serif/sans fallback). Stop both dev servers afterward.

- [ ] **Step 5: Final commit check**

Run: `git status`
Expected: clean working tree. If anything is untracked or dirty, review and commit or discard as appropriate.

---

## Post-Plan

Design System phase is done once Task 7 passes. Next: brainstorm the first Cadastros sub-phase (Período + Matéria — the two simplest standalone entities), reusing the Escolas backend pattern and now consuming this design system on the frontend from the start.
