import { useCallback, useEffect, useState } from "react";
import { diasNaoLetivosService } from "../services/dias-nao-letivos.service.js";
import type { DiaNaoLetivo, CreateDiaNaoLetivoInput } from "../types.js";

export function useDiasNaoLetivos(escolaId: string) {
  const [dias, setDias] = useState<DiaNaoLetivo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!escolaId) {
      setDias([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const items = await diasNaoLetivosService.listByEscola(escolaId);
      setDias(items);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível carregar o calendário.");
    } finally {
      setLoading(false);
    }
  }, [escolaId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function create(data: CreateDiaNaoLetivoInput) {
    await diasNaoLetivosService.create(escolaId, data);
    await refresh();
  }

  async function remove(id: string) {
    await diasNaoLetivosService.remove(id);
    await refresh();
  }

  return { dias, loading, error, create, remove };
}
