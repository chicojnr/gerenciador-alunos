import type { FastifyInstance } from "fastify";
import { notaService, NotaValidationError } from "./notas.service.js";
import { requireAuth } from "../../core/auth-hook.js";
import type { Config } from "../../core/config.js";
import type { LancarNotasInput } from "./notas.types.js";

export function registerNotasRoutes(app: FastifyInstance, config: Config) {
  const auth = { preHandler: requireAuth(config) };

  app.get<{ Querystring: { turmaId: string; materiaId: string; bimestre: string } }>(
    "/notas",
    auth,
    async (request, reply) => {
      try {
        return await notaService.listByTurmaMateriaBimestre(
          request.query.turmaId,
          request.query.materiaId,
          Number(request.query.bimestre)
        );
      } catch (err) {
        if (err instanceof NotaValidationError) {
          return reply.code(400).send({ error: err.message });
        }
        throw err;
      }
    }
  );

  app.post<{ Body: LancarNotasInput }>("/notas/lote", auth, async (request, reply) => {
    try {
      return await notaService.lancar(request.body);
    } catch (err) {
      if (err instanceof NotaValidationError) {
        return reply.code(400).send({ error: err.message });
      }
      throw err;
    }
  });
}
