import { useEffect, useState } from "react";
import { apiClient } from "../../core/apiClient.js";
import type { Option } from "../types.js";

interface ResponsavelListResponse {
  items: Option[];
  total: number;
}

export function useResponsavelOptions() {
  const [responsaveis, setResponsaveis] = useState<Option[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    apiClient.get<ResponsavelListResponse>("/responsaveis").then((result) => {
      if (!cancelled) {
        setResponsaveis(result.items);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return { responsaveis, loading };
}
