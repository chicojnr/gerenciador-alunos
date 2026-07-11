import type { FastifyInstance } from "fastify";
import {
  turmaMateriaService,
  TurmaMateriaNotFoundError,
  TurmaMateriaValidationError,
  TurmaMateriaDuplicateError
} from "./turma-materias.service.js";
import { requireAuth } from "../../core/auth-hook.js";
import type { Config } from "../../core/config.js";
import type { CreateTurmaMateriaInput } from "./turma-materias.types.js";

export function registerTurmaMateriasRoutes(app: FastifyInstance, config: Config) {
  const auth = { preHandler: requireAuth(config) };

  app.get<{ Params: { turmaId: string } }>(
    "/turmas/:turmaId/materias",
    auth,
    async (request) => {
      return turmaMateriaService.listByTurma(request.params.turmaId);
    }
  );

  app.post<{ Params: { turmaId: string }; Body: CreateTurmaMateriaInput }>(
    "/turmas/:turmaId/materias",
    auth,
    async (request, reply) => {
      try {
        const item = await turmaMateriaService.create(request.params.turmaId, request.body);
        return reply.code(201).send(item);
      } catch (err) {
        if (err instanceof TurmaMateriaValidationError || err instanceof TurmaMateriaDuplicateError) {
          return reply.code(400).send({ error: err.message });
        }
        throw err;
      }
    }
  );

  app.delete<{ Params: { turmaId: string; id: string } }>(
    "/turmas/:turmaId/materias/:id",
    auth,
    async (request, reply) => {
      try {
        return await turmaMateriaService.remove(request.params.id);
      } catch (err) {
        if (err instanceof TurmaMateriaNotFoundError) {
          return reply.code(404).send({ error: "Atribuição não encontrada" });
        }
        throw err;
      }
    }
  );
}
