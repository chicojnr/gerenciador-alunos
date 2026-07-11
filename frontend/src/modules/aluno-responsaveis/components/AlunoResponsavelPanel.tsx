import { useState, FormEvent } from "react";
import { X, Plus } from "lucide-react";
import { useAlunoResponsaveis } from "../hooks/useAlunoResponsaveis.js";
import { useResponsavelOptions } from "../../../shared/hooks/useResponsavelOptions.js";
import { Button } from "../../../shared/components/Button.js";

interface AlunoResponsavelPanelProps {
  alunoId: string;
}

const SELECT_CLASSES =
  "flex-1 rounded-md border border-zinc-300 px-2 py-1.5 text-sm focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600";

export function AlunoResponsavelPanel({ alunoId }: AlunoResponsavelPanelProps) {
  const { alunoResponsaveis, loading, create, remove } = useAlunoResponsaveis(alunoId);
  const { responsaveis } = useResponsavelOptions();
  const [responsavelId, setResponsavelId] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleAdd(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!responsavelId) {
      return;
    }
    try {
      await create({ responsavelId });
      setResponsavelId("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível vincular o responsável.");
    }
  }

  return (
    <div className="mt-6 border-t border-zinc-200 pt-4">
      <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
        Pais/Responsáveis
      </h2>

      {loading ? (
        <p className="text-sm text-zinc-400">Carregando...</p>
      ) : alunoResponsaveis.length === 0 ? (
        <p className="text-sm text-zinc-400">Nenhum responsável vinculado ainda.</p>
      ) : (
        <ul className="mb-3 space-y-1.5">
          {alunoResponsaveis.map((ar) => (
            <li
              key={ar.id}
              className="flex items-center justify-between rounded-md bg-zinc-50 px-3 py-1.5 text-sm"
            >
              <span className="font-medium text-zinc-800">{ar.responsavel.nome}</span>
              <button
                onClick={() => remove(ar.id)}
                aria-label={`Remover ${ar.responsavel.nome}`}
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
          value={responsavelId}
          onChange={(e) => setResponsavelId(e.target.value)}
          className={SELECT_CLASSES}
        >
          <option value="">Responsável</option>
          {responsaveis.map((r) => (
            <option key={r.id} value={r.id}>
              {r.nome}
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
