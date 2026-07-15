import { useCallback, useEffect, useState } from "react";
import { materiasService } from "../services/materias.service.js";
import type { Materia, CreateMateriaInput, UpdateMateriaInput } from "../types.js";

export function useMaterias() {
  const [materias, setMaterias] = useState<Materia[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const { items } = await materiasService.list();
    setMaterias(items);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function create(data: CreateMateriaInput) {
    await materiasService.create(data);
    await refresh();
  }

  async function update(id: string, data: UpdateMateriaInput) {
    await materiasService.update(id, data);
    await refresh();
  }

  async function remove(id: string) {
    await materiasService.remove(id);
    await refresh();
  }

  return { materias, loading, create, update, remove, refresh };
}
