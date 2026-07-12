import type { FastifyInstance } from "fastify";
import {
  diaNaoLetivoService,
  DiaNaoLetivoNotFoundError,
  DiaNaoLetivoValidationError,
  DiaNaoLetivoDuplicateError
} from "./dias-nao-letivos.service.js";
import { requireAuth } from "../../core/auth-hook.js";
import type { Config } from "../../core/config.js";
import type { CreateDiaNaoLetivoInput } from "./dias-nao-letivos.types.js";

export function registerDiasNaoLetivosRoutes(app: FastifyInstance, config: Config) {
  const auth = { preHandler: requireAuth(config) };

  app.get<{ Params: { escolaId: string } }>(
    "/escolas/:escolaId/dias-nao-letivos",
    auth,
    async (request) => {
      return diaNaoLetivoService.listByEscola(request.params.escolaId);
    }
  );

  app.post<{ Params: { escolaId: string }; Body: CreateDiaNaoLetivoInput }>(
    "/escolas/:escolaId/dias-nao-letivos",
    auth,
    async (request, reply) => {
      try {
        const item = await diaNaoLetivoService.create(request.params.escolaId, request.body);
        return reply.code(201).send(item);
      } catch (err) {
        if (
          err instanceof DiaNaoLetivoValidationError ||
          err instanceof DiaNaoLetivoDuplicateError
        ) {
          return reply.code(400).send({ error: err.message });
        }
        throw err;
      }
    }
  );

  app.delete<{ Params: { id: string } }>("/dias-nao-letivos/:id", auth, async (request, reply) => {
    try {
      return await diaNaoLetivoService.remove(request.params.id);
    } catch (err) {
      if (err instanceof DiaNaoLetivoNotFoundError) {
        return reply.code(404).send({ error: "Dia não letivo não encontrado" });
      }
      throw err;
    }
  });
}
