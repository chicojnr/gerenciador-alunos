import { usuarioRepository } from "./usuarios.repository.js";
import { hashPassword } from "../../core/password.js";
import type { CreateUsuarioInput, UpdateUsuarioInput } from "./usuarios.types.js";

export class UsuarioNotFoundError extends Error {}
export class UsuarioValidationError extends Error {}
export class CannotDeactivateSelfError extends Error {}

function assertValidName(name: string | undefined) {
  if (name !== undefined && name.trim().length === 0) {
    throw new UsuarioValidationError("nome não pode ser vazio");
  }
}

export const usuarioService = {
  listOptions() {
    return usuarioRepository.listOptions();
  },

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
      throw new UsuarioValidationError("email não pode ser vazio");
    }
    if (!data.password || data.password.length < 8) {
      throw new UsuarioValidationError("senha deve ter pelo menos 8 caracteres");
    }

    const existing = await usuarioRepository.findByEmail(data.email);
    if (existing) {
      throw new UsuarioValidationError("email já está em uso");
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

    if (data.email !== undefined) {
      if (data.email.trim().length === 0) {
        throw new UsuarioValidationError("email não pode ser vazio");
      }
      const existing = await usuarioRepository.findByEmail(data.email);
      if (existing && existing.id !== id) {
        throw new UsuarioValidationError("email já está em uso");
      }
    }

    let passwordHash: string | undefined;
    if (data.password !== undefined) {
      if (data.password.length < 8) {
        throw new UsuarioValidationError("senha deve ter pelo menos 8 caracteres");
      }
      passwordHash = await hashPassword(data.password);
    }

    return usuarioRepository.update(id, {
      name: data.name,
      email: data.email,
      role: data.role,
      passwordHash
    });
  },

  async remove(id: string, requestingUserId: string) {
    if (id === requestingUserId) {
      throw new CannotDeactivateSelfError();
    }
    await this.getById(id);
    return usuarioRepository.softDelete(id);
  }
};
