import { useState, FormEvent } from "react";
import { useAlunoSituacoes } from "../hooks/useAlunoSituacoes.js";
import { useSituacaoOptions } from "../../../shared/hooks/useSituacaoOptions.js";
import { Button } from "../../../shared/components/Button.js";
import { useConfirm } from "../../../shared/contexts/ConfirmContext.js";

interface AlunoSituacaoPanelProps {
  alunoId: string;
  onChanged?: () => void;
}

const SELECT_CLASSES =
  "flex-1 rounded-md border border-zinc-300 px-2 py-1.5 text-sm focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("pt-BR", { timeZone: "UTC" });
}

export function AlunoSituacaoPanel({ alunoId, onChanged }: AlunoSituacaoPanelProps) {
  const { historico, loading, change } = useAlunoSituacoes(alunoId);
  const { situacoes } = useSituacaoOptions();
  const confirm = useConfirm();
  const [situacaoId, setSituacaoId] = useState("");
  const [dataMudanca, setDataMudanca] = useState(() => new Date().toISOString().slice(0, 10));
  const [observacao, setObservacao] = useState("");
  const [error, setError] = useState<string | null>(null);

  const atual = historico[0];

  async function handleChange(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!situacaoId || !dataMudanca) {
      return;
    }

    const situacaoNome = situacoes.find((s) => s.id === situacaoId)?.nome ?? situacaoId;
    const ok = await confirm({
      title: "Mudar situação",
      message: `Confirma a mudança de situação para "${situacaoNome}"?`,
      confirmLabel: "Mudar situação"
    });
    if (!ok) {
      return;
    }

    try {
      await change({ situacaoId, dataMudanca, observacao: observacao || undefined });
      setSituacaoId("");
      setObservacao("");
      onChanged?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível mudar a situação.");
    }
  }

  return (
    <div className="mt-6 border-t border-zinc-200 pt-4">
      <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
        Situação do Aluno
      </h2>

      {loading ? (
        <p className="text-sm text-zinc-400">Carregando...</p>
      ) : (
        <>
          {atual && (
            <p className="mb-3 text-sm text-zinc-800">
              Situação atual: <span className="font-medium">{atual.situacao.nome}</span>
            </p>
          )}
          <ul className="mb-3 space-y-1.5">
            {historico.map((h) => (
              <li
                key={h.id}
                className="flex items-center justify-between rounded-md bg-zinc-50 px-3 py-1.5 text-sm"
              >
                <span className="font-medium text-zinc-800">{h.situacao.nome}</span>
                <span className="text-zinc-500">{formatDate(h.dataMudanca)}</span>
              </li>
            ))}
          </ul>
        </>
      )}

      <form onSubmit={handleChange} className="flex flex-wrap items-end gap-2">
        <select
          value={situacaoId}
          onChange={(e) => setSituacaoId(e.target.value)}
          className={SELECT_CLASSES}
        >
          <option value="">Nova situação</option>
          {situacoes.map((s) => (
            <option key={s.id} value={s.id}>
              {s.nome}
            </option>
          ))}
        </select>
        <input
          type="date"
          value={dataMudanca}
          onChange={(e) => setDataMudanca(e.target.value)}
          className={SELECT_CLASSES}
        />
        <input
          value={observacao}
          onChange={(e) => setObservacao(e.target.value)}
          placeholder="Observação (opcional)"
          className={SELECT_CLASSES}
        />
        <Button type="submit" variant="secondary">
          Mudar situação
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
