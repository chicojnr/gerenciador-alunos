import { prisma } from "../../core/prisma.js";
import type { Role } from "@prisma/client";
import type { UpdateUsuarioInput } from "./usuarios.types.js";

// Never select passwordHash — no route in this module should ever return it.
const SAFE_SELECT = {
  id: true,
  name: true,
  email: true,
  role: true,
  ativo: true,
  createdAt: true
} as const;

interface CreateUserRow {
  name: string;
  email: string;
  passwordHash: string;
  role: Role;
}

export const usuarioRepository = {
  async list(page: number, pageSize: number) {
    const [items, total] = await Promise.all([
      prisma.user.findMany({
        where: { ativo: true },
        select: SAFE_SELECT,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { name: "asc" }
      }),
      prisma.user.count({ where: { ativo: true } })
    ]);
    return { items, total };
  },

  findById(id: string) {
    return prisma.user.findUnique({ where: { id }, select: SAFE_SELECT });
  },

  findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email }, select: { id: true } });
  },

  create(data: CreateUserRow) {
    return prisma.user.create({ data, select: SAFE_SELECT });
  },

  update(id: string, data: UpdateUsuarioInput) {
    return prisma.user.update({ where: { id }, data, select: SAFE_SELECT });
  },

  softDelete(id: string) {
    return prisma.user.update({ where: { id }, data: { ativo: false }, select: SAFE_SELECT });
  }
};
