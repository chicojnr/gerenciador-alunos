import { useCallback, useEffect, useState } from "react";
import { responsaveisComunicacaoService } from "../services/responsaveis-comunicacao.service.js";
import type {
  ResponsavelComunicacao,
  CreateResponsavelComunicacaoInput,
  UpdateResponsavelComunicacaoInput
} from "../types.js";

export function useResponsaveisComunicacao() {
  const [items, setItems] = useState<ResponsavelComunicacao[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const { items: fetched } = await responsaveisComunicacaoService.list();
    setItems(fetched);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function create(data: CreateResponsavelComunicacaoInput) {
    await responsaveisComunicacaoService.create(data);
    await refresh();
  }

  async function update(id: string, data: UpdateResponsavelComunicacaoInput) {
    await responsaveisComunicacaoService.update(id, data);
    await refresh();
  }

  async function remove(id: string) {
    await responsaveisComunicacaoService.remove(id);
    await refresh();
  }

  return { items, loading, create, update, remove };
}
