import { useCallback, useEffect, useState } from "react";
import { situacoesAlunoService } from "../services/situacoes-aluno.service.js";
import type { SituacaoAluno, CreateSituacaoAlunoInput, UpdateSituacaoAlunoInput } from "../types.js";

export function useSituacoesAluno() {
  const [situacoes, setSituacoes] = useState<SituacaoAluno[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const { items } = await situacoesAlunoService.list();
    setSituacoes(items);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function create(data: CreateSituacaoAlunoInput) {
    await situacoesAlunoService.create(data);
    await refresh();
  }

  async function update(id: string, data: UpdateSituacaoAlunoInput) {
    await situacoesAlunoService.update(id, data);
    await refresh();
  }

  async function remove(id: string) {
    await situacoesAlunoService.remove(id);
    await refresh();
  }

  return { situacoes, loading, create, update, remove };
}
