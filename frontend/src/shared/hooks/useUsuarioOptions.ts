import { useEffect, useState } from "react";
import { apiClient } from "../../core/apiClient.js";
import type { Option } from "../types.js";

export function useUsuarioOptions() {
  const [usuarios, setUsuarios] = useState<Option[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    apiClient.get<Option[]>("/usuarios/options").then((result) => {
      if (!cancelled) {
        setUsuarios(result);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return { usuarios, loading };
}
