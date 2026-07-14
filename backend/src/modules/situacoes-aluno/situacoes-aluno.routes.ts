import type { FastifyInstance } from "fastify";
import {
  situacaoAlunoService,
  SituacaoAlunoNotFoundError,
  SituacaoAlunoValidationError
} from "./situacoes-aluno.service.js";
import { requireAuth } from "../../core/auth-hook.js";
import type { Config } from "../../core/config.js";
import type { CreateSituacaoAlunoInput, UpdateSituacaoAlunoInput } from "./situacoes-aluno.types.js";

export function registerSituacoesAlunoRoutes(app: FastifyInstance, config: Config) {
  const auth = { preHandler: requireAuth(config) };

  app.get<{ Querystring: { page?: string; pageSize?: string } }>(
    "/situacoes-aluno",
    auth,
    async (request) => {
      const page = Number(request.query.page ?? 1);
      const pageSize = Number(request.query.pageSize ?? 20);
      return situacaoAlunoService.list(page, pageSize);
    }
  );

  app.get<{ Params: { id: string } }>("/situacoes-aluno/:id", auth, async (request, reply) => {
    try {
      return await situacaoAlunoService.getById(request.params.id);
    } catch (err) {
      if (err instanceof SituacaoAlunoNotFoundError) {
        return reply.code(404).send({ error: "Situação não encontrada" });
      }
      throw err;
    }
  });

  app.post<{ Body: CreateSituacaoAlunoInput }>("/situacoes-aluno", auth, async (request, reply) => {
    try {
      const situacao = await situacaoAlunoService.create(request.body);
      return reply.code(201).send(situacao);
    } catch (err) {
      if (err instanceof SituacaoAlunoValidationError) {
        return reply.code(400).send({ error: err.message });
      }
      throw err;
    }
  });

  app.put<{ Params: { id: string }; Body: UpdateSituacaoAlunoInput }>(
    "/situacoes-aluno/:id",
    auth,
    async (request, reply) => {
      try {
        return await situacaoAlunoService.update(request.params.id, request.body);
      } catch (err) {
        if (err instanceof SituacaoAlunoNotFoundError) {
          return reply.code(404).send({ error: "Situação não encontrada" });
        }
        if (err instanceof SituacaoAlunoValidationError) {
          return reply.code(400).send({ error: err.message });
        }
        throw err;
      }
    }
  );

  app.delete<{ Params: { id: string } }>("/situacoes-aluno/:id", auth, async (request, reply) => {
    try {
      return await situacaoAlunoService.remove(request.params.id);
    } catch (err) {
      if (err instanceof SituacaoAlunoNotFoundError) {
        return reply.code(404).send({ error: "Situação não encontrada" });
      }
      throw err;
    }
  });
}
