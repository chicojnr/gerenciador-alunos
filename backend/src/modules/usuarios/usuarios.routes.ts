import type { FastifyInstance } from "fastify";
import {
  usuarioService,
  UsuarioNotFoundError,
  UsuarioValidationError,
  CannotDeactivateSelfError
} from "./usuarios.service.js";
import { requireAuth, requireRole } from "../../core/auth-hook.js";
import type { Config } from "../../core/config.js";
import type { CreateUsuarioInput, UpdateUsuarioInput } from "./usuarios.types.js";

export function registerUsuariosRoutes(app: FastifyInstance, config: Config) {
  const auth = { preHandler: [requireAuth(config), requireRole("ADMIN")] };

  app.get<{ Querystring: { page?: string; pageSize?: string } }>(
    "/usuarios",
    auth,
    async (request) => {
      const page = Number(request.query.page ?? 1);
      const pageSize = Number(request.query.pageSize ?? 20);
      return usuarioService.list(page, pageSize);
    }
  );

  app.get<{ Params: { id: string } }>("/usuarios/:id", auth, async (request, reply) => {
    try {
      return await usuarioService.getById(request.params.id);
    } catch (err) {
      if (err instanceof UsuarioNotFoundError) {
        return reply.code(404).send({ error: "Usuario not found" });
      }
      throw err;
    }
  });

  app.post<{ Body: CreateUsuarioInput }>("/usuarios", auth, async (request, reply) => {
    try {
      const usuario = await usuarioService.create(request.body);
      return reply.code(201).send(usuario);
    } catch (err) {
      if (err instanceof UsuarioValidationError) {
        return reply.code(400).send({ error: err.message });
      }
      throw err;
    }
  });

  app.put<{ Params: { id: string }; Body: UpdateUsuarioInput }>(
    "/usuarios/:id",
    auth,
    async (request, reply) => {
      try {
        return await usuarioService.update(request.params.id, request.body);
      } catch (err) {
        if (err instanceof UsuarioNotFoundError) {
          return reply.code(404).send({ error: "Usuario not found" });
        }
        if (err instanceof UsuarioValidationError) {
          return reply.code(400).send({ error: err.message });
        }
        throw err;
      }
    }
  );

  app.delete<{ Params: { id: string } }>("/usuarios/:id", auth, async (request, reply) => {
    try {
      return await usuarioService.remove(request.params.id, request.user!.id);
    } catch (err) {
      if (err instanceof UsuarioNotFoundError) {
        return reply.code(404).send({ error: "Usuario not found" });
      }
      if (err instanceof CannotDeactivateSelfError) {
        return reply.code(400).send({ error: "Cannot deactivate your own account" });
      }
      throw err;
    }
  });
}
