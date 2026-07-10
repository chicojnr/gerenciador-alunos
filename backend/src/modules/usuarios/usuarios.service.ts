import { usuarioRepository } from "./usuarios.repository.js";
import { hashPassword } from "../../core/password.js";
import type { CreateUsuarioInput, UpdateUsuarioInput } from "./usuarios.types.js";

export class UsuarioNotFoundError extends Error {}
export class UsuarioValidationError extends Error {}
export class CannotDeactivateSelfError extends Error {}

function assertValidName(name: string | undefined) {
  if (name !== undefined && name.trim().length === 0) {
    throw new UsuarioValidationError("name must not be empty");
  }
}

export const usuarioService = {
  list(page: number, pageSize: number) {
    return usuarioRepository.list(page, pageSize);
  },

  async getById(id: string) {
    const usuario = await usuarioRepository.findById(id);
    if (!usuario) {
      throw new UsuarioNotFoundError(id);
    }
    return usuario;
  },

  async create(data: CreateUsuarioInput) {
    assertValidName(data.name);
    if (!data.email || data.email.trim().length === 0) {
      throw new UsuarioValidationError("email must not be empty");
    }
    if (!data.password || data.password.length < 8) {
      throw new UsuarioValidationError("password must be at least 8 characters");
    }

    const existing = await usuarioRepository.findByEmail(data.email);
    if (existing) {
      throw new UsuarioValidationError("email already in use");
    }

    const passwordHash = await hashPassword(data.password);
    return usuarioRepository.create({
      name: data.name,
      email: data.email,
      passwordHash,
      role: data.role
    });
  },

  async update(id: string, data: UpdateUsuarioInput) {
    assertValidName(data.name);
    await this.getById(id);
    return usuarioRepository.update(id, data);
  },

  async remove(id: string, requestingUserId: string) {
    if (id === requestingUserId) {
      throw new CannotDeactivateSelfError();
    }
    await this.getById(id);
    return usuarioRepository.softDelete(id);
  }
};
