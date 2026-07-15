import { useState, FormEvent } from "react";
import { Button } from "../../../shared/components/Button.js";
import { useEscolaOptions } from "../../../shared/hooks/useEscolaOptions.js";
import { usePeriodoOptions } from "../../../shared/hooks/usePeriodoOptions.js";
import type { CreateTurmaInput } from "../types.js";

interface TurmaFormProps {
  initial?: CreateTurmaInput;
  submitLabel: string;
  onSubmit: (data: CreateTurmaInput) => Promise<void>;
  onCancel: () => void;
}

const INPUT_CLASSES =
  "w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600";

export function TurmaForm({ initial, submitLabel, onSubmit, onCancel }: TurmaFormProps) {
  const { escolas, loading: loadingEscolas } = useEscolaOptions();
  const { periodos, loading: loadingPeriodos } = usePeriodoOptions();
  const [nome, setNome] = useState(initial?.nome ?? "");
  const [serie, setSerie] = useState(initial?.serie ?? "");
  const [escolaId, setEscolaId] = useState(initial?.escolaId ?? "");
  const [periodoId, setPeriodoId] = useState(initial?.periodoId ?? "");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await onSubmit({ nome, serie, escolaId, periodoId });
      if (!initial) {
        setNome("");
        setSerie("");
        setEscolaId("");
        setPeriodoId("");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível salvar a turma.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        placeholder="Nome da turma"
        className={INPUT_CLASSES}
      />
      <input
        value={serie}
        onChange={(e) => setSerie(e.target.value)}
        placeholder="Série/Ano (ex: 6º Ano)"
        className={INPUT_CLASSES}
      />
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
      <select
        value={periodoId}
        onChange={(e) => setPeriodoId(e.target.value)}
        disabled={loadingPeriodos}
        className={INPUT_CLASSES}
      >
        <option value="">Selecione um período</option>
        {periodos.map((periodo) => (
          <option key={periodo.id} value={periodo.id}>
            {periodo.nome}
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
