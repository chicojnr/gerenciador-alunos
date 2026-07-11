import type { FastifyInstance } from "fastify";
import {
  responsavelService,
  ResponsavelNotFoundError,
  ResponsavelValidationError
} from "./responsaveis.service.js";
import { requireAuth } from "../../core/auth-hook.js";
import type { Config } from "../../core/config.js";
import type { CreateResponsavelInput, UpdateResponsavelInput } from "./responsaveis.types.js";

export function registerResponsaveisRoutes(app: FastifyInstance, config: Config) {
  const auth = { preHandler: requireAuth(config) };

  app.get<{ Querystring: { page?: string; pageSize?: string } }>(
    "/responsaveis",
    auth,
    async (request) => {
      const page = Number(request.query.page ?? 1);
      const pageSize = Number(request.query.pageSize ?? 20);
      return responsavelService.list(page, pageSize);
    }
  );

  app.get<{ Params: { id: string } }>("/responsaveis/:id", auth, async (request, reply) => {
    try {
      return await responsavelService.getById(request.params.id);
    } catch (err) {
      if (err instanceof ResponsavelNotFoundError) {
        return reply.code(404).send({ error: "Responsável não encontrado" });
      }
      throw err;
    }
  });

  app.post<{ Body: CreateResponsavelInput }>("/responsaveis", auth, async (request, reply) => {
    try {
      const responsavel = await responsavelService.create(request.body);
      return reply.code(201).send(responsavel);
    } catch (err) {
      if (err instanceof ResponsavelValidationError) {
        return reply.code(400).send({ error: err.message });
      }
      throw err;
    }
  });

  app.put<{ Params: { id: string }; Body: UpdateResponsavelInput }>(
    "/responsaveis/:id",
    auth,
    async (request, reply) => {
      try {
        return await responsavelService.update(request.params.id, request.body);
      } catch (err) {
        if (err instanceof ResponsavelNotFoundError) {
          return reply.code(404).send({ error: "Responsável não encontrado" });
        }
        if (err instanceof ResponsavelValidationError) {
          return reply.code(400).send({ error: err.message });
        }
        throw err;
      }
    }
  );

  app.delete<{ Params: { id: string } }>("/responsaveis/:id", auth, async (request, reply) => {
    try {
      return await responsavelService.remove(request.params.id);
    } catch (err) {
      if (err instanceof ResponsavelNotFoundError) {
        return reply.code(404).send({ error: "Responsável não encontrado" });
      }
      throw err;
    }
  });
}
