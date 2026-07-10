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
    <form onSubmit={handleSubmit}>
      <input
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        placeholder="Nome da escola"
      />
      <Button type="submit">{submitLabel}</Button>
      {error && <p role="alert">{error}</p>}
    </form>
  );
}
