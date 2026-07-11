import { useCallback, useEffect, useState } from "react";
import { turmaMateriasService } from "../services/turma-materias.service.js";
import type { TurmaMateria, CreateTurmaMateriaInput } from "../types.js";

export function useTurmaMaterias(turmaId: string) {
  const [turmaMaterias, setTurmaMaterias] = useState<TurmaMateria[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const items = await turmaMateriasService.list(turmaId);
    setTurmaMaterias(items);
    setLoading(false);
  }, [turmaId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function create(data: CreateTurmaMateriaInput) {
    await turmaMateriasService.create(turmaId, data);
    await refresh();
  }

  async function remove(id: string) {
    await turmaMateriasService.remove(turmaId, id);
    await refresh();
  }

  return { turmaMaterias, loading, create, remove };
}
