import { useCallback, useEffect, useState } from "react";
import { responsaveisService } from "../services/responsaveis.service.js";
import type { Responsavel, CreateResponsavelInput, UpdateResponsavelInput } from "../types.js";

export function useResponsaveis() {
  const [responsaveis, setResponsaveis] = useState<Responsavel[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const { items } = await responsaveisService.list();
    setResponsaveis(items);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function create(data: CreateResponsavelInput) {
    await responsaveisService.create(data);
    await refresh();
  }

  async function update(id: string, data: UpdateResponsavelInput) {
    await responsaveisService.update(id, data);
    await refresh();
  }

  async function remove(id: string) {
    await responsaveisService.remove(id);
    await refresh();
  }

  return { responsaveis, loading, create, update, remove };
}
