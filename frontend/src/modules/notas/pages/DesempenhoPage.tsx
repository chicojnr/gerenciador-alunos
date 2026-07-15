import { useEffect, useState } from "react";
import { LineChart, Save } from "lucide-react";
import { useTurmaOptions } from "../../../shared/hooks/useTurmaOptions.js";
import { useMateriaOptions } from "../../../shared/hooks/useMateriaOptions.js";
import { alunosService } from "../../alunos/services/alunos.service.js";
import { notasService } from "../services/notas.service.js";
import { Button } from "../../../shared/components/Button.js";
import type { Aluno } from "../../alunos/types.js";

const SELECT_CLASSES =
  "rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600";

const BIMESTRES = [1, 2, 3, 4];

export function DesempenhoPage() {
  const { turmas, loading: loadingTurmas } = useTurmaOptions();
  const { materias, loading: loadingMaterias } = useMateriaOptions();
  const [turmaId, setTurmaId] = useState("");
  const [materiaId, setMateriaId] = useState("");
  const [bimestre, setBimestre] = useState(1);
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [notas, setNotas] = useState<Record<string, string>>({});
  const [loadingDados, setLoadingDados] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (!turmaId || !materiaId) {
      setAlunos([]);
      return;
    }
    let cancelado = false;
    setLoadingDados(true);
    setSaved(false);
    setLoadError(null);
    Promise.all([
      alunosService.list(turmaId),
      notasService.listByTurmaMateriaBimestre(turmaId, materiaId, bimestre)
    ])
      .then(([alunosRes, notasRes]) => {
        if (cancelado) {
          return;
        }
        setAlunos(alunosRes.items);
        const mapa: Record<string, string> = {};
        for (const n of notasRes.notas) {
          mapa[n.alunoId] = String(n.valor);
        }
        setNotas(mapa);
        setLoadingDados(false);
      })
      .catch((err) => {
        if (cancelado) {
          return;
        }
        setLoadError(err instanceof Error ? err.message : "Não foi possível carregar as notas.");
        setLoadingDados(false);
      });
    return () => {
      cancelado = true;
    };
  }, [turmaId, materiaId, bimestre]);

  function setNota(alunoId: string, valor: string) {
    setNotas((prev) => ({ ...prev, [alunoId]: valor }));
    setSaved(false);
  }

  async function handleSave() {
    setSaving(true);
    setSaveError(null);
    try {
      const lancamentos = Object.entries(notas).map(([alunoId, valor]) => ({
        alunoId,
        valor: valor === "" ? null : Number(valor)
      }));
      await notasService.lancar({ materiaId, bimestre, notas: lancamentos });
      setSaved(true);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Não foi possível salvar as notas.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center gap-2.5">
        <LineChart className="h-5 w-5 text-zinc-400" strokeWidth={2} />
        <h1 className="text-xl font-semibold text-zinc-900">Desempenho</h1>
      </div>

      <div className="mb-6 flex gap-3">
        <select
          value={turmaId}
          onChange={(e) => setTurmaId(e.target.value)}
          disabled={loadingTurmas}
          className={SELECT_CLASSES}
        >
          <option value="">Selecione uma turma</option>
          {turmas.map((t) => (
            <option key={t.id} value={t.id}>
              {t.nome}
            </option>
          ))}
        </select>
        <select
          value={materiaId}
          onChange={(e) => setMateriaId(e.target.value)}
          disabled={loadingMaterias}
          className={SELECT_CLASSES}
        >
          <option value="">Selecione uma disciplina</option>
          {materias.map((m) => (
            <option key={m.id} value={m.id}>
              {m.nome}
            </option>
          ))}
        </select>
        <select
          value={bimestre}
          onChange={(e) => setBimestre(Number(e.target.value))}
          className={SELECT_CLASSES}
        >
          {BIMESTRES.map((b) => (
            <option key={b} value={b}>
              {b}º Bimestre
            </option>
          ))}
        </select>
      </div>

      {!turmaId || !materiaId ? (
        <p className="text-sm text-zinc-400">Selecione turma e disciplina para lançar notas.</p>
      ) : loadingDados ? (
        <p className="text-sm text-zinc-400">Carregando...</p>
      ) : loadError ? (
        <p role="alert" className="text-sm text-red-600">
          {loadError}
        </p>
      ) : alunos.length === 0 ? (
        <p className="text-sm text-zinc-400">Nenhum aluno nesta turma.</p>
      ) : (
        <div className="rounded-lg border border-zinc-200 bg-white">
          <ul className="divide-y divide-zinc-100">
            {alunos.map((aluno) => (
              <li key={aluno.id} className="flex items-center gap-3 px-4 py-2.5 text-sm">
                <span className="flex-1 text-zinc-800">{aluno.nome}</span>
                <input
                  type="number"
                  min={0}
                  max={10}
                  step={0.1}
                  value={notas[aluno.id] ?? ""}
                  onChange={(e) => setNota(aluno.id, e.target.value)}
                  placeholder="0-10"
                  className="w-20 rounded-md border border-zinc-300 px-2 py-1 text-right text-sm tabular-nums focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                />
              </li>
            ))}
          </ul>
          <div className="flex items-center gap-3 border-t border-zinc-100 px-4 py-3">
            <Button onClick={handleSave} disabled={saving}>
              <Save className="mr-1.5 h-4 w-4" strokeWidth={2.25} />
              {saving ? "Salvando..." : "Salvar"}
            </Button>
            {saved && <span className="text-sm text-emerald-600">Notas salvas.</span>}
            {saveError && (
              <span role="alert" className="text-sm text-red-600">
                {saveError}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
