import { useEffect, useState } from "react";
import { apiClient } from "../../core/apiClient.js";
import type { Option } from "../types.js";

interface TurmaListResponse {
  items: Option[];
  total: number;
}

export function useTurmaOptions() {
  const [turmas, setTurmas] = useState<Option[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    apiClient.get<TurmaListResponse>("/turmas").then((result) => {
      if (!cancelled) {
        setTurmas(result.items);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return { turmas, loading };
}
