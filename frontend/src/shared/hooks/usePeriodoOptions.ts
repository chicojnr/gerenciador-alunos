import { useEffect, useState } from "react";
import { apiClient } from "../../core/apiClient.js";
import type { Option } from "../types.js";

interface PeriodoListResponse {
  items: Option[];
  total: number;
}

export function usePeriodoOptions() {
  const [periodos, setPeriodos] = useState<Option[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    apiClient.get<PeriodoListResponse>("/periodos").then((result) => {
      if (!cancelled) {
        setPeriodos(result.items);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return { periodos, loading };
}
