import { useCallback, useEffect, useState } from "react";
import { escolasService } from "../services/escolas.service.js";
import type { Escola, CreateEscolaInput, UpdateEscolaInput } from "../types.js";

export function useEscolas() {
  const [escolas, setEscolas] = useState<Escola[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const { items } = await escolasService.list();
    setEscolas(items);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function create(data: CreateEscolaInput) {
    await escolasService.create(data);
    await refresh();
  }

  async function update(id: string, data: UpdateEscolaInput) {
    await escolasService.update(id, data);
    await refresh();
  }

  async function remove(id: string) {
    await escolasService.remove(id);
    await refresh();
  }

  return { escolas, loading, create, update, remove };
}
