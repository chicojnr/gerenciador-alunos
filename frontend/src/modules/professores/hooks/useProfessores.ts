import { useCallback, useEffect, useState } from "react";
import { professoresService } from "../services/professores.service.js";
import type { Professor, CreateProfessorInput, UpdateProfessorInput } from "../types.js";

export function useProfessores() {
  const [professores, setProfessores] = useState<Professor[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const { items } = await professoresService.list();
    setProfessores(items);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function create(data: CreateProfessorInput) {
    await professoresService.create(data);
    await refresh();
  }

  async function update(id: string, data: UpdateProfessorInput) {
    await professoresService.update(id, data);
    await refresh();
  }

  async function remove(id: string) {
    await professoresService.remove(id);
    await refresh();
  }

  return { professores, loading, create, update, remove };
}
