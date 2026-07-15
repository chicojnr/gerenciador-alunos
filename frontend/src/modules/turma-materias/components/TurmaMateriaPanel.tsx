import { useState, FormEvent } from "react";
import { X, Plus } from "lucide-react";
import { useTurmaMaterias } from "../hooks/useTurmaMaterias.js";
import { useMateriaOptions } from "../../../shared/hooks/useMateriaOptions.js";
import { useProfessorOptions } from "../../../shared/hooks/useProfessorOptions.js";
import { Button } from "../../../shared/components/Button.js";
import { useConfirm } from "../../../shared/contexts/ConfirmContext.js";

interface TurmaMateriaPanelProps {
  turmaId: string;
}

const SELECT_CLASSES =
  "flex-1 rounded-md border border-zinc-300 px-2 py-1.5 text-sm focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600";

export function TurmaMateriaPanel({ turmaId }: TurmaMateriaPanelProps) {
  const { turmaMaterias, loading, create, remove } = useTurmaMaterias(turmaId);
  const confirm = useConfirm();
  const { materias } = useMateriaOptions();
  const { professores } = useProfessorOptions();
  const [materiaId, setMateriaId] = useState("");
  const [professorId, setProfessorId] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleAdd(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!materiaId || !professorId) {
      return;
    }
    try {
      await create({ materiaId, professorId });
      setMateriaId("");
      setProfessorId("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível atribuir a disciplina.");
    }
  }

  async function handleRemove(id: string, materiaNome: string) {
    const ok = await confirm({
      title: "Remover atribuição",
      message: `Tem certeza que deseja remover "${materiaNome}" desta turma?`,
      confirmLabel: "Remover",
      variant: "danger"
    });
    if (ok) {
      await remove(id);
    }
  }

  return (
    <div className="mt-6 border-t border-zinc-200 pt-4">
      <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
        Grade horária
      </h2>

      {loading ? (
        <p className="text-sm text-zinc-400">Carregando...</p>
      ) : turmaMaterias.length === 0 ? (
        <p className="text-sm text-zinc-400">Nenhuma disciplina atribuída ainda.</p>
      ) : (
        <ul className="mb-3 space-y-1.5">
          {turmaMaterias.map((tm) => (
            <li
              key={tm.id}
              className="flex items-center justify-between rounded-md bg-zinc-50 px-3 py-1.5 text-sm"
            >
              <span className="text-zinc-800">
                <span className="font-medium">{tm.materia.nome}</span>
                <span className="text-zinc-400"> — {tm.professor.nome}</span>
              </span>
              <button
                onClick={() => handleRemove(tm.id, tm.materia.nome)}
                aria-label={`Remover ${tm.materia.nome}`}
                className="rounded p-1 text-zinc-400 transition-colors duration-150 hover:bg-zinc-200 hover:text-zinc-700"
              >
                <X className="h-3.5 w-3.5" strokeWidth={2} />
              </button>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={handleAdd} className="flex items-end gap-2">
        <select
          value={materiaId}
          onChange={(e) => setMateriaId(e.target.value)}
          className={SELECT_CLASSES}
        >
          <option value="">Disciplina</option>
          {materias.map((m) => (
            <option key={m.id} value={m.id}>
              {m.nome}
            </option>
          ))}
        </select>
        <select
          value={professorId}
          onChange={(e) => setProfessorId(e.target.value)}
          className={SELECT_CLASSES}
        >
          <option value="">Professor</option>
          {professores.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nome}
            </option>
          ))}
        </select>
        <Button type="submit" variant="secondary">
          <Plus className="h-3.5 w-3.5" strokeWidth={2.25} />
        </Button>
      </form>
      {error && (
        <p role="alert" className="mt-2 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
