import { useCallback, useEffect, useState } from "react";
import { usuariosService } from "../services/usuarios.service.js";
import type { Usuario, CreateUsuarioInput, UpdateUsuarioInput } from "../types.js";

export function useUsuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const { items } = await usuariosService.list();
    setUsuarios(items);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function create(data: CreateUsuarioInput) {
    await usuariosService.create(data);
    await refresh();
  }

  async function update(id: string, data: UpdateUsuarioInput) {
    await usuariosService.update(id, data);
    await refresh();
  }

  async function remove(id: string) {
    await usuariosService.remove(id);
    await refresh();
  }

  return { usuarios, loading, create, update, remove };
}
