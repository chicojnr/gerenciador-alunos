import { useState, FormEvent } from "react";
import { Button } from "../../../shared/components/Button.js";
import type { CreateResponsavelInput } from "../types.js";

interface ResponsavelFormProps {
  initial?: CreateResponsavelInput;
  submitLabel: string;
  onSubmit: (data: CreateResponsavelInput) => Promise<void>;
}

const INPUT_CLASSES =
  "w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600";

export function ResponsavelForm({ initial, submitLabel, onSubmit }: ResponsavelFormProps) {
  const [nome, setNome] = useState(initial?.nome ?? "");
  const [telefone, setTelefone] = useState(initial?.telefone ?? "");
  const [email, setEmail] = useState(initial?.email ?? "");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await onSubmit({ nome, telefone: telefone || undefined, email: email || undefined });
      if (!initial) {
        setNome("");
        setTelefone("");
        setEmail("");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível salvar o responsável.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        placeholder="Nome do responsável"
        className={INPUT_CLASSES}
      />
      <input
        value={telefone}
        onChange={(e) => setTelefone(e.target.value)}
        placeholder="Telefone (opcional)"
        className={INPUT_CLASSES}
      />
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email (opcional)"
        className={INPUT_CLASSES}
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
