import type { FastifyInstance } from "fastify";
import {
  calendarioLetivoService,
  CalendarioLetivoNotFoundError,
  CalendarioLetivoValidationError
} from "./calendarios-letivos.service.js";
import { requireAuth } from "../../core/auth-hook.js";
import type { Config } from "../../core/config.js";
import type {
  CreateCalendarioLetivoInput,
  UpdateCalendarioLetivoInput
} from "./calendarios-letivos.types.js";

export function registerCalendariosLetivosRoutes(app: FastifyInstance, config: Config) {
  const auth = { preHandler: requireAuth(config) };

  app.get<{ Querystring: { page?: string; pageSize?: string } }>(
    "/calendarios-letivos",
    auth,
    async (request) => {
      const page = Number(request.query.page ?? 1);
      const pageSize = Number(request.query.pageSize ?? 20);
      return calendarioLetivoService.list(page, pageSize);
    }
  );

  app.get<{ Params: { id: string } }>("/calendarios-letivos/:id", auth, async (request, reply) => {
    try {
      return await calendarioLetivoService.getById(request.params.id);
    } catch (err) {
      if (err instanceof CalendarioLetivoNotFoundError) {
        return reply.code(404).send({ error: "Calendário letivo não encontrado" });
      }
      throw err;
    }
  });

  app.post<{ Body: CreateCalendarioLetivoInput }>(
    "/calendarios-letivos",
    auth,
    async (request, reply) => {
      try {
        const calendario = await calendarioLetivoService.create(request.body);
        return reply.code(201).send(calendario);
      } catch (err) {
        if (err instanceof CalendarioLetivoValidationError) {
          return reply.code(400).send({ error: err.message });
        }
        throw err;
      }
    }
  );

  app.put<{ Params: { id: string }; Body: UpdateCalendarioLetivoInput }>(
    "/calendarios-letivos/:id",
    auth,
    async (request, reply) => {
      try {
        return await calendarioLetivoService.update(request.params.id, request.body);
      } catch (err) {
        if (err instanceof CalendarioLetivoNotFoundError) {
          return reply.code(404).send({ error: "Calendário letivo não encontrado" });
        }
        if (err instanceof CalendarioLetivoValidationError) {
          return reply.code(400).send({ error: err.message });
        }
        throw err;
      }
    }
  );

  app.delete<{ Params: { id: string } }>(
    "/calendarios-letivos/:id",
    auth,
    async (request, reply) => {
      try {
        return await calendarioLetivoService.remove(request.params.id);
      } catch (err) {
        if (err instanceof CalendarioLetivoNotFoundError) {
          return reply.code(404).send({ error: "Calendário letivo não encontrado" });
        }
        throw err;
      }
    }
  );
}
