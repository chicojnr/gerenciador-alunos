import { apiClient } from "../../../core/apiClient.js";
import type { Usuario, CreateUsuarioInput, UpdateUsuarioInput } from "../types.js";

interface UsuarioListResponse {
  items: Usuario[];
  total: number;
}

export const usuariosService = {
  list: () => apiClient.get<UsuarioListResponse>("/usuarios"),
  create: (data: CreateUsuarioInput) => apiClient.post<Usuario>("/usuarios", data),
  update: (id: string, data: UpdateUsuarioInput) =>
    apiClient.put<Usuario>(`/usuarios/${id}`, data),
  remove: (id: string) => apiClient.del<Usuario>(`/usuarios/${id}`)
};
