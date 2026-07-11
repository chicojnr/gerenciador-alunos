import { useCallback, useEffect, useState } from "react";
import { alunoResponsaveisService } from "../services/aluno-responsaveis.service.js";
import type { AlunoResponsavel, CreateAlunoResponsavelInput } from "../types.js";

export function useAlunoResponsaveis(alunoId: string) {
  const [alunoResponsaveis, setAlunoResponsaveis] = useState<AlunoResponsavel[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const items = await alunoResponsaveisService.list(alunoId);
    setAlunoResponsaveis(items);
    setLoading(false);
  }, [alunoId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function create(data: CreateAlunoResponsavelInput) {
    await alunoResponsaveisService.create(alunoId, data);
    await refresh();
  }

  async function remove(id: string) {
    await alunoResponsaveisService.remove(alunoId, id);
    await refresh();
  }

  return { alunoResponsaveis, loading, create, remove };
}
