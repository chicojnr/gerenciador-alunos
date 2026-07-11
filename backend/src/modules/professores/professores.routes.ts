import type { FastifyInstance } from "fastify";
import {
  professorService,
  ProfessorNotFoundError,
  ProfessorValidationError
} from "./professores.service.js";
import { requireAuth } from "../../core/auth-hook.js";
import type { Config } from "../../core/config.js";
import type { CreateProfessorInput, UpdateProfessorInput } from "./professores.types.js";

export function registerProfessoresRoutes(app: FastifyInstance, config: Config) {
  const auth = { preHandler: requireAuth(config) };

  app.get<{ Querystring: { page?: string; pageSize?: string } }>(
    "/professores",
    auth,
    async (request) => {
      const page = Number(request.query.page ?? 1);
      const pageSize = Number(request.query.pageSize ?? 20);
      return professorService.list(page, pageSize);
    }
  );

  app.get<{ Params: { id: string } }>("/professores/:id", auth, async (request, reply) => {
    try {
      return await professorService.getById(request.params.id);
    } catch (err) {
      if (err instanceof ProfessorNotFoundError) {
        return reply.code(404).send({ error: "Professor não encontrado" });
      }
      throw err;
    }
  });

  app.post<{ Body: CreateProfessorInput }>("/professores", auth, async (request, reply) => {
    try {
      const professor = await professorService.create(request.body);
      return reply.code(201).send(professor);
    } catch (err) {
      if (err instanceof ProfessorValidationError) {
        return reply.code(400).send({ error: err.message });
      }
      throw err;
    }
  });

  app.put<{ Params: { id: string }; Body: UpdateProfessorInput }>(
    "/professores/:id",
    auth,
    async (request, reply) => {
      try {
        return await professorService.update(request.params.id, request.body);
      } catch (err) {
        if (err instanceof ProfessorNotFoundError) {
          return reply.code(404).send({ error: "Professor não encontrado" });
        }
        if (err instanceof ProfessorValidationError) {
          return reply.code(400).send({ error: err.message });
        }
        throw err;
      }
    }
  );

  app.delete<{ Params: { id: string } }>("/professores/:id", auth, async (request, reply) => {
    try {
      return await professorService.remove(request.params.id);
    } catch (err) {
      if (err instanceof ProfessorNotFoundError) {
        return reply.code(404).send({ error: "Professor não encontrado" });
      }
      throw err;
    }
  });
}
