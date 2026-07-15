import { useState, FormEvent } from "react";
import { Button } from "../../../shared/components/Button.js";
import { useTurmaOptions } from "../../../shared/hooks/useTurmaOptions.js";
import type { CreateAlunoInput } from "../types.js";

interface AlunoFormProps {
  initial?: CreateAlunoInput;
  submitLabel: string;
  onSubmit: (data: CreateAlunoInput) => Promise<void>;
  onCancel: () => void;
}

const INPUT_CLASSES =
  "w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600";

export function AlunoForm({ initial, submitLabel, onSubmit, onCancel }: AlunoFormProps) {
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
      <div>
        <label htmlFor="aluno-nome" className="mb-1 block text-xs font-medium text-zinc-600">
          Nome
        </label>
        <input
          id="aluno-nome"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Nome do aluno"
          className={INPUT_CLASSES}
        />
      </div>
      <div>
        <label
          htmlFor="aluno-data-nascimento"
          className="mb-1 block text-xs font-medium text-zinc-600"
        >
          Data de nascimento
        </label>
        <input
          id="aluno-data-nascimento"
          type="date"
          value={dataNascimento}
          onChange={(e) => setDataNascimento(e.target.value)}
          className={INPUT_CLASSES}
        />
      </div>
      <div>
        <label htmlFor="aluno-turma" className="mb-1 block text-xs font-medium text-zinc-600">
          Turma
        </label>
        <select
          id="aluno-turma"
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
      </div>
      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}
      <div className="flex gap-2">
        <Button type="submit">{submitLabel}</Button>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
