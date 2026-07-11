import { useEffect, useState } from "react";
import { apiClient } from "../../core/apiClient.js";
import type { Option } from "../types.js";

export function useEscolaOptions() {
  const [escolas, setEscolas] = useState<Option[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    apiClient.get<Option[]>("/escolas/options").then((result) => {
      if (!cancelled) {
        setEscolas(result);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return { escolas, loading };
}
