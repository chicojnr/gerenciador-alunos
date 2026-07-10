import type { Role } from "@prisma/client";

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
