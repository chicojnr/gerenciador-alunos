import { useEffect, useState } from "react";
import { AlertTriangle, Send } from "lucide-react";
import { indicadoresService } from "../services/indicadores.service.js";
import { Button } from "../../../shared/components/Button.js";
import { EnviarMensagemModal } from "../../mensagens/components/EnviarMensagemModal.js";
import type { AvaliacaoIndicador } from "../types.js";

export function AlertasPage() {
  const [avaliacao, setAvaliacao] = useState<AvaliacaoIndicador[]>([]);
  const [loading, setLoading] = useState(true);
  const [selecionados, setSelecionados] = useState<Set<string>>(new Set());
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    indicadoresService.avaliacao().then((result) => {
      setAvaliacao(result);
      setLoading(false);
    });
  }, []);

  function toggle(alunoId: string) {
    setSelecionados((prev) => {
      const next = new Set(prev);
      if (next.has(alunoId)) {
        next.delete(alunoId);
      } else {
        next.add(alunoId);
      }
      return next;
    });
  }

  if (loading) {
    return <p className="text-zinc-500">Carregando...</p>;
  }

  const semAlertas = avaliacao.every((a) => a.alunos.length === 0);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <AlertTriangle className="h-5 w-5 text-amber-500" strokeWidth={2} />
          <h1 className="text-xl font-semibold text-zinc-900">Alertas de Falta</h1>
        </div>
        {selecionados.size > 0 && (
          <Button onClick={() => setModalOpen(true)}>
            <Send className="mr-1.5 h-4 w-4" strokeWidth={2.25} />
            Enviar mensagem ({selecionados.size})
          </Button>
        )}
      </div>

      {semAlertas ? (
        <p className="text-sm text-zinc-400">Nenhum aluno atingiu um indicador configurado.</p>
      ) : (
        <div className="space-y-6">
          {avaliacao
            .filter((a) => a.alunos.length > 0)
            .map(({ indicador, alunos }) => (
              <div key={indicador.id} className="rounded-lg border border-zinc-200 bg-white">
                <div className="border-b border-zinc-100 px-4 py-3">
                  <h2 className="text-sm font-semibold text-zinc-900">{indicador.nome}</h2>
                  <p className="text-xs text-zinc-400">
                    {alunos.length} aluno{alunos.length === 1 ? "" : "s"} atingiu o limite
                  </p>
                </div>
                <ul className="divide-y divide-zinc-100">
                  {alunos.map((aluno) => (
                    <li key={aluno.id} className="flex items-center gap-3 px-4 py-2.5 text-sm">
                      <input
                        type="checkbox"
                        checked={selecionados.has(aluno.id)}
                        onChange={() => toggle(aluno.id)}
                        className="h-4 w-4 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-600"
                      />
                      <span className="font-medium text-zinc-800">{aluno.nome}</span>
                      <span className="text-zinc-400">{aluno.turma.nome}</span>
                      <span className="ml-auto rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-600">
                        {aluno.faltas} faltas
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
        </div>
      )}

      <EnviarMensagemModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelecionados(new Set());
        }}
        alunoIds={[...selecionados]}
      />
    </div>
  );
}
