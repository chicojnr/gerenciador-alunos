import { useCallback, useEffect, useState } from "react";
import { indicadoresService } from "../services/indicadores.service.js";
import type { Indicador, CreateIndicadorInput, UpdateIndicadorInput } from "../types.js";

export function useIndicadores(escolaId?: string) {
  const [indicadores, setIndicadores] = useState<Indicador[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { items } = await indicadoresService.list(escolaId);
      setIndicadores(items);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível carregar os indicadores.");
    } finally {
      setLoading(false);
    }
  }, [escolaId]);

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

  return { indicadores, loading, error, create, update, remove };
}
