import type { FastifyInstance } from "fastify";
import { faltaService, FaltaValidationError } from "./faltas.service.js";
import { requireAuth } from "../../core/auth-hook.js";
import type { Config } from "../../core/config.js";
import type { RegistrarFaltasInput } from "./faltas.types.js";

export function registerFaltasRoutes(app: FastifyInstance, config: Config) {
  const auth = { preHandler: requireAuth(config) };

  app.get<{ Querystring: { turmaId: string; data: string } }>(
    "/faltas/dia",
    auth,
    async (request, reply) => {
      try {
        return await faltaService.listByTurmaAndData(request.query.turmaId, request.query.data);
      } catch (err) {
        if (err instanceof FaltaValidationError) {
          return reply.code(400).send({ error: err.message });
        }
        throw err;
      }
    }
  );

  app.post<{ Body: RegistrarFaltasInput }>("/faltas/registro", auth, async (request, reply) => {
    try {
      return await faltaService.registrarDia(request.body);
    } catch (err) {
      if (err instanceof FaltaValidationError) {
        return reply.code(400).send({ error: err.message });
      }
      throw err;
    }
  });
}
