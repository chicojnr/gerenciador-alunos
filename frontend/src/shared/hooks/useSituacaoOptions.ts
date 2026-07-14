import { useEffect, useState } from "react";
import { apiClient } from "../../core/apiClient.js";
import type { Option } from "../types.js";

interface SituacaoListResponse {
  items: Option[];
  total: number;
}

export function useSituacaoOptions() {
  const [situacoes, setSituacoes] = useState<Option[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    apiClient.get<SituacaoListResponse>("/situacoes-aluno").then((result) => {
      if (!cancelled) {
        setSituacoes(result.items);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return { situacoes, loading };
}
