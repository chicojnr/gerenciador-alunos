import type { FastifyInstance } from "fastify";
import {
  responsavelComunicacaoService,
  ResponsavelComunicacaoNotFoundError,
  ResponsavelComunicacaoValidationError,
  ResponsavelComunicacaoDuplicateError
} from "./responsaveis-comunicacao.service.js";
import { requireAuth } from "../../core/auth-hook.js";
import type { Config } from "../../core/config.js";
import type {
  CreateResponsavelComunicacaoInput,
  UpdateResponsavelComunicacaoInput
} from "./responsaveis-comunicacao.types.js";

export function registerResponsaveisComunicacaoRoutes(app: FastifyInstance, config: Config) {
  const auth = { preHandler: requireAuth(config) };

  app.get<{ Querystring: { page?: string; pageSize?: string } }>(
    "/responsaveis-comunicacao",
    auth,
    async (request) => {
      const page = Number(request.query.page ?? 1);
      const pageSize = Number(request.query.pageSize ?? 20);
      return responsavelComunicacaoService.list(page, pageSize);
    }
  );

  app.get<{ Params: { id: string } }>(
    "/responsaveis-comunicacao/:id",
    auth,
    async (request, reply) => {
      try {
        return await responsavelComunicacaoService.getById(request.params.id);
      } catch (err) {
        if (err instanceof ResponsavelComunicacaoNotFoundError) {
          return reply.code(404).send({ error: "Responsável de comunicação não encontrado" });
        }
        throw err;
      }
    }
  );

  app.post<{ Body: CreateResponsavelComunicacaoInput }>(
    "/responsaveis-comunicacao",
    auth,
    async (request, reply) => {
      try {
        const item = await responsavelComunicacaoService.create(request.body);
        return reply.code(201).send(item);
      } catch (err) {
        if (err instanceof ResponsavelComunicacaoValidationError) {
          return reply.code(400).send({ error: err.message });
        }
        if (err instanceof ResponsavelComunicacaoDuplicateError) {
          return reply.code(400).send({ error: err.message });
        }
        throw err;
      }
    }
  );

  app.put<{ Params: { id: string }; Body: UpdateResponsavelComunicacaoInput }>(
    "/responsaveis-comunicacao/:id",
    auth,
    async (request, reply) => {
      try {
        return await responsavelComunicacaoService.update(request.params.id, request.body);
      } catch (err) {
        if (err instanceof ResponsavelComunicacaoNotFoundError) {
          return reply.code(404).send({ error: "Responsável de comunicação não encontrado" });
        }
        if (err instanceof ResponsavelComunicacaoValidationError) {
          return reply.code(400).send({ error: err.message });
        }
        if (err instanceof ResponsavelComunicacaoDuplicateError) {
          return reply.code(400).send({ error: err.message });
        }
        throw err;
      }
    }
  );

  app.delete<{ Params: { id: string } }>(
    "/responsaveis-comunicacao/:id",
    auth,
    async (request, reply) => {
      try {
        return await responsavelComunicacaoService.remove(request.params.id);
      } catch (err) {
        if (err instanceof ResponsavelComunicacaoNotFoundError) {
          return reply.code(404).send({ error: "Responsável de comunicação não encontrado" });
        }
        throw err;
      }
    }
  );
}
