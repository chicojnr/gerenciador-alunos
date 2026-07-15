import { useState, FormEvent } from "react";
import { Button } from "../../../shared/components/Button.js";
import type { CreateEscolaInput } from "../types.js";

interface EscolaFormProps {
  initial?: CreateEscolaInput;
  submitLabel: string;
  onSubmit: (data: CreateEscolaInput) => Promise<void>;
  onCancel: () => void;
}

export function EscolaForm({ initial, submitLabel, onSubmit, onCancel }: EscolaFormProps) {
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
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível salvar a escola.");
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
      <div className="flex gap-2">
        <Button type="submit">{submitLabel}</Button>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}
    </form>
  );
}
