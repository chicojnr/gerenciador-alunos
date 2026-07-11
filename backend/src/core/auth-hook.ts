import type { FastifyReply, FastifyRequest } from "fastify";
import type { Role } from "@prisma/client";
import { verifyToken } from "./jwt.js";
import type { Config } from "./config.js";
import { prisma } from "./prisma.js";

export function requireAuth(config: Config) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const token = request.cookies.access_token;
    if (!token) {
      return reply.code(401).send({ error: "Não autenticado" });
    }

    try {
      const payload = verifyToken(token, config.jwtAccessSecret);
      const user = await prisma.user.findUnique({ where: { id: payload.userId } });
      if (!user || !user.ativo) {
        return reply.code(401).send({ error: "Não autenticado" });
      }
      request.user = { id: user.id, role: user.role, email: user.email, name: user.name };
    } catch {
      return reply.code(401).send({ error: "Não autenticado" });
    }
  };
}

export function requireRole(role: Role) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    if (request.user?.role !== role) {
      return reply.code(403).send({ error: "Acesso negado" });
    }
  };
}
