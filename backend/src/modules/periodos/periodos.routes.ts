import type { FastifyInstance } from "fastify";
import { periodoService, PeriodoNotFoundError, PeriodoValidationError } from "./periodos.service.js";
import { requireAuth } from "../../core/auth-hook.js";
import type { Config } from "../../core/config.js";
import type { CreatePeriodoInput, UpdatePeriodoInput } from "./periodos.types.js";

export function registerPeriodosRoutes(app: FastifyInstance, config: Config) {
  const auth = { preHandler: requireAuth(config) };

  app.get<{ Querystring: { page?: string; pageSize?: string } }>(
    "/periodos",
    auth,
    async (request) => {
      const page = Number(request.query.page ?? 1);
      const pageSize = Number(request.query.pageSize ?? 20);
      return periodoService.list(page, pageSize);
    }
  );

  app.get<{ Params: { id: string } }>("/periodos/:id", auth, async (request, reply) => {
    try {
      return await periodoService.getById(request.params.id);
    } catch (err) {
      if (err instanceof PeriodoNotFoundError) {
        return reply.code(404).send({ error: "Período não encontrado" });
      }
      throw err;
    }
  });

  app.post<{ Body: CreatePeriodoInput }>("/periodos", auth, async (request, reply) => {
    try {
      const periodo = await periodoService.create(request.body);
      return reply.code(201).send(periodo);
    } catch (err) {
      if (err instanceof PeriodoValidationError) {
        return reply.code(400).send({ error: err.message });
      }
      throw err;
    }
  });

  app.put<{ Params: { id: string }; Body: UpdatePeriodoInput }>(
    "/periodos/:id",
    auth,
    async (request, reply) => {
      try {
        return await periodoService.update(request.params.id, request.body);
      } catch (err) {
        if (err instanceof PeriodoNotFoundError) {
          return reply.code(404).send({ error: "Período não encontrado" });
        }
        if (err instanceof PeriodoValidationError) {
          return reply.code(400).send({ error: err.message });
        }
        throw err;
      }
    }
  );

  app.delete<{ Params: { id: string } }>("/periodos/:id", auth, async (request, reply) => {
    try {
      return await periodoService.remove(request.params.id);
    } catch (err) {
      if (err instanceof PeriodoNotFoundError) {
        return reply.code(404).send({ error: "Período não encontrado" });
      }
      throw err;
    }
  });
}
