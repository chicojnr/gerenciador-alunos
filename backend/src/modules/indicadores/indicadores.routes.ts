import type { FastifyInstance } from "fastify";
import {
  indicadorService,
  IndicadorNotFoundError,
  IndicadorValidationError
} from "./indicadores.service.js";
import { requireAuth } from "../../core/auth-hook.js";
import type { Config } from "../../core/config.js";
import type { CreateIndicadorInput, UpdateIndicadorInput } from "./indicadores.types.js";

export function registerIndicadoresRoutes(app: FastifyInstance, config: Config) {
  const auth = { preHandler: requireAuth(config) };

  app.get<{ Querystring: { page?: string; pageSize?: string } }>(
    "/indicadores",
    auth,
    async (request) => {
      const page = Number(request.query.page ?? 1);
      const pageSize = Number(request.query.pageSize ?? 20);
      return indicadorService.list(page, pageSize);
    }
  );

  app.get("/indicadores/avaliacao", auth, async () => {
    return indicadorService.avaliar();
  });

  app.get<{ Params: { id: string } }>("/indicadores/:id", auth, async (request, reply) => {
    try {
      return await indicadorService.getById(request.params.id);
    } catch (err) {
      if (err instanceof IndicadorNotFoundError) {
        return reply.code(404).send({ error: "Indicador não encontrado" });
      }
      throw err;
    }
  });

  app.post<{ Body: CreateIndicadorInput }>("/indicadores", auth, async (request, reply) => {
    try {
      const indicador = await indicadorService.create(request.body);
      return reply.code(201).send(indicador);
    } catch (err) {
      if (err instanceof IndicadorValidationError) {
        return reply.code(400).send({ error: err.message });
      }
      throw err;
    }
  });

  app.put<{ Params: { id: string }; Body: UpdateIndicadorInput }>(
    "/indicadores/:id",
    auth,
    async (request, reply) => {
      try {
        return await indicadorService.update(request.params.id, request.body);
      } catch (err) {
        if (err instanceof IndicadorNotFoundError) {
          return reply.code(404).send({ error: "Indicador não encontrado" });
        }
        if (err instanceof IndicadorValidationError) {
          return reply.code(400).send({ error: err.message });
        }
        throw err;
      }
    }
  );

  app.delete<{ Params: { id: string } }>("/indicadores/:id", auth, async (request, reply) => {
    try {
      return await indicadorService.remove(request.params.id);
    } catch (err) {
      if (err instanceof IndicadorNotFoundError) {
        return reply.code(404).send({ error: "Indicador não encontrado" });
      }
      throw err;
    }
  });
}
