import type { FastifyInstance } from "fastify";
import { escolaService, EscolaNotFoundError, EscolaValidationError } from "./escolas.service.js";
import { requireAuth } from "../../core/auth-hook.js";
import type { Config } from "../../core/config.js";
import type { CreateEscolaInput, UpdateEscolaInput } from "./escolas.types.js";

export function registerEscolasRoutes(app: FastifyInstance, config: Config) {
  const auth = { preHandler: requireAuth(config) };

  app.get<{ Querystring: { page?: string; pageSize?: string } }>(
    "/escolas",
    auth,
    async (request) => {
      const page = Number(request.query.page ?? 1);
      const pageSize = Number(request.query.pageSize ?? 20);
      return escolaService.list(page, pageSize);
    }
  );

  app.get<{ Params: { id: string } }>("/escolas/:id", auth, async (request, reply) => {
    try {
      return await escolaService.getById(request.params.id);
    } catch (err) {
      if (err instanceof EscolaNotFoundError) {
        return reply.code(404).send({ error: "Escola not found" });
      }
      throw err;
    }
  });

  app.post<{ Body: CreateEscolaInput }>("/escolas", auth, async (request, reply) => {
    try {
      const escola = await escolaService.create(request.body);
      return reply.code(201).send(escola);
    } catch (err) {
      if (err instanceof EscolaValidationError) {
        return reply.code(400).send({ error: err.message });
      }
      throw err;
    }
  });

  app.put<{ Params: { id: string }; Body: UpdateEscolaInput }>(
    "/escolas/:id",
    auth,
    async (request, reply) => {
      try {
        return await escolaService.update(request.params.id, request.body);
      } catch (err) {
        if (err instanceof EscolaNotFoundError) {
          return reply.code(404).send({ error: "Escola not found" });
        }
        if (err instanceof EscolaValidationError) {
          return reply.code(400).send({ error: err.message });
        }
        throw err;
      }
    }
  );

  app.delete<{ Params: { id: string } }>("/escolas/:id", auth, async (request, reply) => {
    try {
      return await escolaService.remove(request.params.id);
    } catch (err) {
      if (err instanceof EscolaNotFoundError) {
        return reply.code(404).send({ error: "Escola not found" });
      }
      throw err;
    }
  });
}
