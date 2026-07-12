import { useCallback, useEffect, useState } from "react";
import { mensagensService } from "../services/mensagens.service.js";
import type { Template, CreateTemplateInput, UpdateTemplateInput } from "../types.js";

export function useTemplates() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { items } = await mensagensService.listTemplates();
      setTemplates(items);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível carregar os templates.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function create(data: CreateTemplateInput) {
    await mensagensService.createTemplate(data);
    await refresh();
  }

  async function update(id: string, data: UpdateTemplateInput) {
    await mensagensService.updateTemplate(id, data);
    await refresh();
  }

  async function remove(id: string) {
    await mensagensService.removeTemplate(id);
    await refresh();
  }

  return { templates, loading, error, create, update, remove };
}
