export type Role = "ADMIN" | "USER";

export interface Usuario {
  id: string;
  name: string;
  email: string;
  role: Role;
  ativo: boolean;
}

export interface CreateUsuarioInput {
  name: string;
  email: string;
  password: string;
  role: Role;
}

export interface UpdateUsuarioInput {
  name?: string;
  role?: Role;
}
