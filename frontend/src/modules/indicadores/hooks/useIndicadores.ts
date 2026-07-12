import { useCallback, useEffect, useState } from "react";
import { indicadoresService } from "../services/indicadores.service.js";
import type { Indicador, CreateIndicadorInput, UpdateIndicadorInput } from "../types.js";

export function useIndicadores() {
  const [indicadores, setIndicadores] = useState<Indicador[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const { items } = await indicadoresService.list();
    setIndicadores(items);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function create(data: CreateIndicadorInput) {
    await indicadoresService.create(data);
    await refresh();
  }

  async function update(id: string, data: UpdateIndicadorInput) {
    await indicadoresService.update(id, data);
    await refresh();
  }

  async function remove(id: string) {
    await indicadoresService.remove(id);
    await refresh();
  }

  return { indicadores, loading, create, update, remove };
}
