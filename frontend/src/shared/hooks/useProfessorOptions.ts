import { useEffect, useState } from "react";
import { apiClient } from "../../core/apiClient.js";
import type { Option } from "../types.js";

interface ProfessorListResponse {
  items: Option[];
  total: number;
}

export function useProfessorOptions() {
  const [professores, setProfessores] = useState<Option[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    apiClient.get<ProfessorListResponse>("/professores").then((result) => {
      if (!cancelled) {
        setProfessores(result.items);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return { professores, loading };
}
