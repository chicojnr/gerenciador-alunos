import { useEffect, useState } from "react";
import { apiClient } from "../../core/apiClient.js";
import type { Option } from "../types.js";

interface MateriaListResponse {
  items: Option[];
  total: number;
}

export function useMateriaOptions() {
  const [materias, setMaterias] = useState<Option[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    apiClient.get<MateriaListResponse>("/materias").then((result) => {
      if (!cancelled) {
        setMaterias(result.items);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return { materias, loading };
}
