import { useState, FormEvent } from "react";
import { Button } from "../../../shared/components/Button.js";
import type { CreateUsuarioInput, UpdateUsuarioInput, Role } from "../types.js";

interface UsuarioFormProps {
  mode: "create" | "edit";
  initial?: { name: string; role: Role };
  submitLabel: string;
  onSubmit: (data: CreateUsuarioInput | UpdateUsuarioInput) => Promise<void>;
}

const INPUT_CLASSES =
  "w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600";

export function UsuarioForm({ mode, initial, submitLabel, onSubmit }: UsuarioFormProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>(initial?.role ?? "USER");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      if (mode === "create") {
        await onSubmit({ name, email, password, role });
        setName("");
        setEmail("");
        setPassword("");
        setRole("USER");
      } else {
        await onSubmit({ name, role });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível salvar o usuário.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Nome"
        className={INPUT_CLASSES}
      />
      {mode === "create" && (
        <>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className={INPUT_CLASSES}
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Senha inicial"
            className={INPUT_CLASSES}
          />
        </>
      )}
      <select value={role} onChange={(e) => setRole(e.target.value as Role)} className={INPUT_CLASSES}>
        <option value="USER">Usuário</option>
        <option value="ADMIN">Admin</option>
      </select>
      <Button type="submit">{submitLabel}</Button>
      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}
    </form>
  );
}
