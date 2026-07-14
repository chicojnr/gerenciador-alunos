import { useState, FormEvent } from "react";
import { Button } from "../../../shared/components/Button.js";
import { useTurmaOptions } from "../../../shared/hooks/useTurmaOptions.js";
import type { CreateAlunoInput } from "../types.js";

interface AlunoFormProps {
  initial?: CreateAlunoInput;
  submitLabel: string;
  onSubmit: (data: CreateAlunoInput) => Promise<void>;
}

const INPUT_CLASSES =
  "w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600";

export function AlunoForm({ initial, submitLabel, onSubmit }: AlunoFormProps) {
  const { turmas, loading: loadingTurmas } = useTurmaOptions();
  const [nome, setNome] = useState(initial?.nome ?? "");
  const [dataNascimento, setDataNascimento] = useState(
    initial?.dataNascimento ? initial.dataNascimento.slice(0, 10) : ""
  );
  const [turmaId, setTurmaId] = useState(initial?.turmaId ?? "");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await onSubmit({ nome, dataNascimento: dataNascimento || undefined, turmaId });
      if (!initial) {
        setNome("");
        setDataNascimento("");
        setTurmaId("");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível salvar o aluno.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        placeholder="Nome do aluno"
        className={INPUT_CLASSES}
      />
      <input
        type="date"
        value={dataNascimento}
        onChange={(e) => setDataNascimento(e.target.value)}
        className={INPUT_CLASSES}
      />
      <select
        value={turmaId}
        onChange={(e) => setTurmaId(e.target.value)}
        disabled={loadingTurmas}
        className={INPUT_CLASSES}
      >
        <option value="">Selecione uma turma</option>
        {turmas.map((turma) => (
          <option key={turma.id} value={turma.id}>
            {turma.nome}
          </option>
        ))}
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
