import { useState, FormEvent } from "react";
import { Button } from "../../../shared/components/Button.js";
import type { CreateMateriaInput } from "../types.js";

interface MateriaFormProps {
  initial?: CreateMateriaInput;
  submitLabel: string;
  onSubmit: (data: CreateMateriaInput) => Promise<void>;
  onCancel: () => void;
}

export function MateriaForm({ initial, submitLabel, onSubmit, onCancel }: MateriaFormProps) {
  const [nome, setNome] = useState(initial?.nome ?? "");
  const [codigo, setCodigo] = useState(initial?.codigo ?? "");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await onSubmit({ nome, codigo });
      if (!initial) {
        setNome("");
        setCodigo("");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível salvar a disciplina.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="materia-codigo" className="mb-1 block text-xs font-medium text-zinc-600">
          Código
        </label>
        <input
          id="materia-codigo"
          value={codigo}
          onChange={(e) => setCodigo(e.target.value)}
          placeholder="Código da disciplina"
          className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
        />
      </div>
      <div>
        <label htmlFor="materia-nome" className="mb-1 block text-xs font-medium text-zinc-600">
          Disciplina
        </label>
        <input
          id="materia-nome"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Nome da disciplina"
          className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
        />
      </div>
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
