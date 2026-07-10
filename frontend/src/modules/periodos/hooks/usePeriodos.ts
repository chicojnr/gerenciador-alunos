import { useCallback, useEffect, useState } from "react";
import { periodosService } from "../services/periodos.service.js";
import type { Periodo, CreatePeriodoInput, UpdatePeriodoInput } from "../types.js";

export function usePeriodos() {
  const [periodos, setPeriodos] = useState<Periodo[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const { items } = await periodosService.list();
    setPeriodos(items);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function create(data: CreatePeriodoInput) {
    await periodosService.create(data);
    await refresh();
  }

  async function update(id: string, data: UpdatePeriodoInput) {
    await periodosService.update(id, data);
    await refresh();
  }

  async function remove(id: string) {
    await periodosService.remove(id);
    await refresh();
  }

  return { periodos, loading, create, update, remove };
}
