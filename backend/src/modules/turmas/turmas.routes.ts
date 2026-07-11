import type { FastifyInstance } from "fastify";
import { turmaService, TurmaNotFoundError, TurmaValidationError } from "./turmas.service.js";
import { requireAuth } from "../../core/auth-hook.js";
import type { Config } from "../../core/config.js";
import type { CreateTurmaInput, UpdateTurmaInput } from "./turmas.types.js";

export function registerTurmasRoutes(app: FastifyInstance, config: Config) {
  const auth = { preHandler: requireAuth(config) };

  app.get<{ Querystring: { page?: string; pageSize?: string } }>(
    "/turmas",
    auth,
    async (request) => {
      const page = Number(request.query.page ?? 1);
      const pageSize = Number(request.query.pageSize ?? 20);
      return turmaService.list(page, pageSize);
    }
  );

  app.get<{ Params: { id: string } }>("/turmas/:id", auth, async (request, reply) => {
    try {
      return await turmaService.getById(request.params.id);
    } catch (err) {
      if (err instanceof TurmaNotFoundError) {
        return reply.code(404).send({ error: "Turma não encontrada" });
      }
      throw err;
    }
  });

  app.post<{ Body: CreateTurmaInput }>("/turmas", auth, async (request, reply) => {
    try {
      const turma = await turmaService.create(request.body);
      return reply.code(201).send(turma);
    } catch (err) {
      if (err instanceof TurmaValidationError) {
        return reply.code(400).send({ error: err.message });
      }
      throw err;
    }
  });

  app.put<{ Params: { id: string }; Body: UpdateTurmaInput }>(
    "/turmas/:id",
    auth,
    async (request, reply) => {
      try {
        return await turmaService.update(request.params.id, request.body);
      } catch (err) {
        if (err instanceof TurmaNotFoundError) {
          return reply.code(404).send({ error: "Turma não encontrada" });
        }
        if (err instanceof TurmaValidationError) {
          return reply.code(400).send({ error: err.message });
        }
        throw err;
      }
    }
  );

  app.delete<{ Params: { id: string } }>("/turmas/:id", auth, async (request, reply) => {
    try {
      return await turmaService.remove(request.params.id);
    } catch (err) {
      if (err instanceof TurmaNotFoundError) {
        return reply.code(404).send({ error: "Turma não encontrada" });
      }
      throw err;
    }
  });
}
