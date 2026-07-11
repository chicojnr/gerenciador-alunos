import type { FastifyInstance } from "fastify";
import {
  alunoResponsavelService,
  AlunoResponsavelNotFoundError,
  AlunoResponsavelValidationError,
  AlunoResponsavelDuplicateError
} from "./aluno-responsaveis.service.js";
import { requireAuth } from "../../core/auth-hook.js";
import type { Config } from "../../core/config.js";
import type { CreateAlunoResponsavelInput } from "./aluno-responsaveis.types.js";

export function registerAlunoResponsaveisRoutes(app: FastifyInstance, config: Config) {
  const auth = { preHandler: requireAuth(config) };

  app.get<{ Params: { alunoId: string } }>(
    "/alunos/:alunoId/responsaveis",
    auth,
    async (request) => {
      return alunoResponsavelService.listByAluno(request.params.alunoId);
    }
  );

  app.post<{ Params: { alunoId: string }; Body: CreateAlunoResponsavelInput }>(
    "/alunos/:alunoId/responsaveis",
    auth,
    async (request, reply) => {
      try {
        const item = await alunoResponsavelService.create(request.params.alunoId, request.body);
        return reply.code(201).send(item);
      } catch (err) {
        if (
          err instanceof AlunoResponsavelValidationError ||
          err instanceof AlunoResponsavelDuplicateError
        ) {
          return reply.code(400).send({ error: err.message });
        }
        throw err;
      }
    }
  );

  app.delete<{ Params: { alunoId: string; id: string } }>(
    "/alunos/:alunoId/responsaveis/:id",
    auth,
    async (request, reply) => {
      try {
        return await alunoResponsavelService.remove(request.params.id);
      } catch (err) {
        if (err instanceof AlunoResponsavelNotFoundError) {
          return reply.code(404).send({ error: "Vínculo não encontrado" });
        }
        throw err;
      }
    }
  );
}
