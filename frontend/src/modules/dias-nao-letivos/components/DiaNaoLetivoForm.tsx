import { useState, FormEvent } from "react";
import { Button } from "../../../shared/components/Button.js";
import type { CreateDiaNaoLetivoInput, TipoDiaNaoLetivo } from "../types.js";

interface DiaNaoLetivoFormProps {
  onSubmit: (data: CreateDiaNaoLetivoInput) => Promise<void>;
  onCancel: () => void;
}

const INPUT_CLASSES =
  "w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600";

export function DiaNaoLetivoForm({ onSubmit, onCancel }: DiaNaoLetivoFormProps) {
  const [data, setData] = useState("");
  const [tipo, setTipo] = useState<TipoDiaNaoLetivo>("FERIADO");
  const [descricao, setDescricao] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await onSubmit({ data, tipo, descricao: descricao || undefined });
      setData("");
      setTipo("FERIADO");
      setDescricao("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível salvar o dia não letivo.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="date"
        value={data}
        onChange={(e) => setData(e.target.value)}
        className={INPUT_CLASSES}
      />
      <select
        value={tipo}
        onChange={(e) => setTipo(e.target.value as TipoDiaNaoLetivo)}
        className={INPUT_CLASSES}
      >
        <option value="FERIADO">Feriado</option>
        <option value="PONTE">Ponte</option>
        <option value="FERIAS">Férias</option>
      </select>
      <input
        value={descricao}
        onChange={(e) => setDescricao(e.target.value)}
        placeholder="Descrição (opcional)"
        className={INPUT_CLASSES}
      />
      <div className="flex gap-2">
        <Button type="submit">Adicionar</Button>
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
