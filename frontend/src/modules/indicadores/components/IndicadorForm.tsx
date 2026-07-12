import { useState, FormEvent } from "react";
import { Button } from "../../../shared/components/Button.js";
import type { CreateIndicadorInput, TipoIndicador } from "../types.js";

interface IndicadorFormProps {
  escolaId: string;
  initial?: CreateIndicadorInput;
  submitLabel: string;
  onSubmit: (data: CreateIndicadorInput) => Promise<void>;
}

const INPUT_CLASSES =
  "w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600";

export function IndicadorForm({ escolaId, initial, submitLabel, onSubmit }: IndicadorFormProps) {
  const [nome, setNome] = useState(initial?.nome ?? "");
  const [tipo, setTipo] = useState<TipoIndicador>(initial?.tipo ?? "CONSECUTIVAS");
  const [quantidade, setQuantidade] = useState(String(initial?.quantidade ?? 1));
  const [janelaDias, setJanelaDias] = useState(
    initial?.janelaDias !== undefined ? String(initial.janelaDias) : "30"
  );
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await onSubmit({
        nome,
        tipo,
        quantidade: Number(quantidade),
        janelaDias: tipo === "NAO_CONSECUTIVAS" ? Number(janelaDias) : undefined,
        escolaId
      });
      if (!initial) {
        setNome("");
        setTipo("CONSECUTIVAS");
        setQuantidade("1");
        setJanelaDias("30");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível salvar o indicador.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        placeholder="Nome (ex: 3 dias consecutivos)"
        className={INPUT_CLASSES}
      />
      <select
        value={tipo}
        onChange={(e) => setTipo(e.target.value as TipoIndicador)}
        className={INPUT_CLASSES}
      >
        <option value="CONSECUTIVAS">Dias consecutivos</option>
        <option value="NAO_CONSECUTIVAS">Dias não consecutivos (em uma janela)</option>
      </select>
      <input
        type="number"
        min={1}
        value={quantidade}
        onChange={(e) => setQuantidade(e.target.value)}
        placeholder="Quantidade de faltas"
        className={INPUT_CLASSES}
      />
      {tipo === "NAO_CONSECUTIVAS" && (
        <input
          type="number"
          min={1}
          value={janelaDias}
          onChange={(e) => setJanelaDias(e.target.value)}
          placeholder="Janela em dias (ex: 30)"
          className={INPUT_CLASSES}
        />
      )}
      <Button type="submit">{submitLabel}</Button>
      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}
    </form>
  );
}
