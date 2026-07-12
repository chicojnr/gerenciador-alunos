import { useEffect, useState } from "react";
import { CalendarX, Save } from "lucide-react";
import { useTurmaOptions } from "../../../shared/hooks/useTurmaOptions.js";
import { alunosService } from "../../alunos/services/alunos.service.js";
import { faltasService } from "../services/faltas.service.js";
import { Button } from "../../../shared/components/Button.js";
import type { Aluno } from "../../alunos/types.js";

const SELECT_CLASSES =
  "rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600";

function hoje(): string {
  return new Date().toISOString().slice(0, 10);
}

export function FaltasPage() {
  const { turmas, loading: loadingTurmas } = useTurmaOptions();
  const [turmaId, setTurmaId] = useState("");
  const [data, setData] = useState(hoje());
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [ausentes, setAusentes] = useState<Set<string>>(new Set());
  const [loadingAlunos, setLoadingAlunos] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!turmaId) {
      setAlunos([]);
      return;
    }
    setLoadingAlunos(true);
    setSaved(false);
    Promise.all([
      alunosService.list(turmaId),
      faltasService.diaByTurma(turmaId, data)
    ]).then(([alunosRes, diaRes]) => {
      setAlunos(alunosRes.items);
      setAusentes(new Set(diaRes.alunoIds));
      setLoadingAlunos(false);
    });
  }, [turmaId, data]);

  function toggle(alunoId: string) {
    setAusentes((prev) => {
      const next = new Set(prev);
      if (next.has(alunoId)) {
        next.delete(alunoId);
      } else {
        next.add(alunoId);
      }
      return next;
    });
    setSaved(false);
  }

  async function handleSave() {
    setSaving(true);
    await faltasService.registrar({ turmaId, data, alunoIds: [...ausentes] });
    setSaving(false);
    setSaved(true);
  }

  return (
    <div>
      <div className="mb-6 flex items-center gap-2.5">
        <CalendarX className="h-5 w-5 text-zinc-400" strokeWidth={2} />
        <h1 className="text-xl font-semibold text-zinc-900">Registro de Faltas</h1>
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
        <input
          type="date"
          value={data}
          onChange={(e) => setData(e.target.value)}
          className={SELECT_CLASSES}
        />
      </div>

      {!turmaId ? (
        <p className="text-sm text-zinc-400">Selecione uma turma para marcar as faltas do dia.</p>
      ) : loadingAlunos ? (
        <p className="text-sm text-zinc-400">Carregando...</p>
      ) : alunos.length === 0 ? (
        <p className="text-sm text-zinc-400">Nenhum aluno nesta turma.</p>
      ) : (
        <div className="rounded-lg border border-zinc-200 bg-white">
          <ul className="divide-y divide-zinc-100">
            {alunos.map((aluno) => (
              <li key={aluno.id} className="flex items-center gap-3 px-4 py-2.5 text-sm">
                <input
                  type="checkbox"
                  checked={ausentes.has(aluno.id)}
                  onChange={() => toggle(aluno.id)}
                  className="h-4 w-4 rounded border-zinc-300 text-red-600 focus:ring-red-600"
                />
                <span className="text-zinc-800">{aluno.nome}</span>
                {ausentes.has(aluno.id) && (
                  <span className="ml-auto rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-600">
                    Ausente
                  </span>
                )}
              </li>
            ))}
          </ul>
          <div className="flex items-center gap-3 border-t border-zinc-100 px-4 py-3">
            <Button onClick={handleSave} disabled={saving}>
              <Save className="mr-1.5 h-4 w-4" strokeWidth={2.25} />
              {saving ? "Salvando..." : "Salvar"}
            </Button>
            {saved && <span className="text-sm text-emerald-600">Faltas registradas.</span>}
          </div>
        </div>
      )}
    </div>
  );
}
