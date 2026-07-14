import { useCallback, useEffect, useState } from "react";
import { alunoSituacoesService } from "../services/aluno-situacoes.service.js";
import type { AlunoSituacaoHistorico, CreateAlunoSituacaoInput } from "../types.js";

export function useAlunoSituacoes(alunoId: string) {
  const [historico, setHistorico] = useState<AlunoSituacaoHistorico[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const items = await alunoSituacoesService.list(alunoId);
    setHistorico(items);
    setLoading(false);
  }, [alunoId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function change(data: CreateAlunoSituacaoInput) {
    await alunoSituacoesService.change(alunoId, data);
    await refresh();
  }

  return { historico, loading, change };
}
