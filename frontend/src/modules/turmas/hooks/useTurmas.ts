import { useCallback, useEffect, useState } from "react";
import { turmasService } from "../services/turmas.service.js";
import type { Turma, CreateTurmaInput, UpdateTurmaInput } from "../types.js";

export function useTurmas() {
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const { items } = await turmasService.list();
    setTurmas(items);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function create(data: CreateTurmaInput) {
    await turmasService.create(data);
    await refresh();
  }

  async function update(id: string, data: UpdateTurmaInput) {
    await turmasService.update(id, data);
    await refresh();
  }

  async function remove(id: string) {
    await turmasService.remove(id);
    await refresh();
  }

  return { turmas, loading, create, update, remove };
}
