import type { FastifyInstance } from "fastify";
import {
  alunoSituacaoService,
  AlunoSituacaoValidationError,
  SituacaoInativaError
} from "./aluno-situacoes.service.js";
import { AlunoNotFoundError } from "../alunos/alunos.service.js";
import { SituacaoAlunoNotFoundError } from "../situacoes-aluno/situacoes-aluno.service.js";
import { requireAuth } from "../../core/auth-hook.js";
import type { Config } from "../../core/config.js";
import type { CreateAlunoSituacaoInput } from "./aluno-situacoes.types.js";

export function registerAlunoSituacoesRoutes(app: FastifyInstance, config: Config) {
  const auth = { preHandler: requireAuth(config) };

  app.get<{ Params: { alunoId: string } }>(
    "/alunos/:alunoId/situacoes",
    auth,
    async (request, reply) => {
      try {
        return await alunoSituacaoService.listByAluno(request.params.alunoId);
      } catch (err) {
        if (err instanceof AlunoNotFoundError) {
          return reply.code(404).send({ error: "Aluno não encontrado" });
        }
        throw err;
      }
    }
  );

  app.post<{ Params: { alunoId: string }; Body: CreateAlunoSituacaoInput }>(
    "/alunos/:alunoId/situacoes",
    auth,
    async (request, reply) => {
      try {
        const historico = await alunoSituacaoService.changeSituacao(
          request.params.alunoId,
          request.body
        );
        return reply.code(201).send(historico);
      } catch (err) {
        if (err instanceof AlunoNotFoundError || err instanceof SituacaoAlunoNotFoundError) {
          return reply.code(404).send({ error: "Aluno ou situação não encontrado(a)" });
        }
        if (err instanceof AlunoSituacaoValidationError || err instanceof SituacaoInativaError) {
          return reply.code(400).send({ error: err.message });
        }
        throw err;
      }
    }
  );
}
