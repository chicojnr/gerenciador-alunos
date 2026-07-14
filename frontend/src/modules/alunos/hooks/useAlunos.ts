import { useCallback, useEffect, useState } from "react";
import { alunosService } from "../services/alunos.service.js";
import type { Aluno, CreateAlunoInput, UpdateAlunoInput } from "../types.js";

export function useAlunos() {
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const { items } = await alunosService.list();
    setAlunos(items);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function create(data: CreateAlunoInput) {
    await alunosService.create(data);
    await refresh();
  }

  async function update(id: string, data: UpdateAlunoInput) {
    await alunosService.update(id, data);
    await refresh();
  }

  async function remove(id: string) {
    await alunosService.remove(id);
    await refresh();
  }

  return { alunos, loading, create, update, remove, refresh };
}
