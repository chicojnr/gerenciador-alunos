import { useState, FormEvent } from "react";
import { Button } from "../../../shared/components/Button.js";
import type { CreateMateriaInput } from "../types.js";

interface MateriaFormProps {
  initial?: CreateMateriaInput;
  submitLabel: string;
  onSubmit: (data: CreateMateriaInput) => Promise<void>;
}

export function MateriaForm({ initial, submitLabel, onSubmit }: MateriaFormProps) {
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
      setError("Não foi possível salvar a matéria. Tente novamente.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        placeholder="Nome da matéria"
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
