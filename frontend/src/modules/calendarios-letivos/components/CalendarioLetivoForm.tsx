import { useState, FormEvent } from "react";
import { Button } from "../../../shared/components/Button.js";
import { useEscolaOptions } from "../../../shared/hooks/useEscolaOptions.js";
import type { CreateCalendarioLetivoInput } from "../types.js";

interface CalendarioLetivoFormProps {
  initial?: CreateCalendarioLetivoInput;
  submitLabel: string;
  onSubmit: (data: CreateCalendarioLetivoInput) => Promise<void>;
  onCancel: () => void;
}

const INPUT_CLASSES =
  "w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600";

export function CalendarioLetivoForm({
  initial,
  submitLabel,
  onSubmit,
  onCancel
}: CalendarioLetivoFormProps) {
  const { escolas, loading: loadingEscolas } = useEscolaOptions();
  const [nome, setNome] = useState(initial?.nome ?? "");
  const [dataInicio, setDataInicio] = useState(initial?.dataInicio?.slice(0, 10) ?? "");
  const [dataFim, setDataFim] = useState(initial?.dataFim?.slice(0, 10) ?? "");
  const [escolaId, setEscolaId] = useState(initial?.escolaId ?? "");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await onSubmit({ nome, dataInicio, dataFim, escolaId });
      if (!initial) {
        setNome("");
        setDataInicio("");
        setDataFim("");
        setEscolaId("");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível salvar o calendário.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        placeholder="Nome (ex: Ano Letivo 2026)"
        className={INPUT_CLASSES}
      />
      <div className="flex gap-3">
        <input
          type="date"
          value={dataInicio}
          onChange={(e) => setDataInicio(e.target.value)}
          className={INPUT_CLASSES}
        />
        <input
          type="date"
          value={dataFim}
          onChange={(e) => setDataFim(e.target.value)}
          className={INPUT_CLASSES}
        />
      </div>
      <select
        value={escolaId}
        onChange={(e) => setEscolaId(e.target.value)}
        disabled={loadingEscolas}
        className={INPUT_CLASSES}
      >
        <option value="">Selecione uma escola</option>
        {escolas.map((escola) => (
          <option key={escola.id} value={escola.id}>
            {escola.nome}
          </option>
        ))}
      </select>
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
