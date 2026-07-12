import type { FastifyInstance } from "fastify";
import { alunoService, AlunoNotFoundError, AlunoValidationError } from "./alunos.service.js";
import { requireAuth } from "../../core/auth-hook.js";
import type { Config } from "../../core/config.js";
import type { CreateAlunoInput, UpdateAlunoInput } from "./alunos.types.js";

export function registerAlunosRoutes(app: FastifyInstance, config: Config) {
  const auth = { preHandler: requireAuth(config) };

  app.get<{ Querystring: { page?: string; pageSize?: string; turmaId?: string } }>(
    "/alunos",
    auth,
    async (request) => {
      const page = Number(request.query.page ?? 1);
      const pageSize = Number(request.query.pageSize ?? 20);
      return alunoService.list(page, pageSize, request.query.turmaId);
    }
  );

  app.get<{ Params: { id: string } }>("/alunos/:id", auth, async (request, reply) => {
    try {
      return await alunoService.getById(request.params.id);
    } catch (err) {
      if (err instanceof AlunoNotFoundError) {
        return reply.code(404).send({ error: "Aluno não encontrado" });
      }
      throw err;
    }
  });

  app.post<{ Body: CreateAlunoInput }>("/alunos", auth, async (request, reply) => {
    try {
      const aluno = await alunoService.create(request.body);
      return reply.code(201).send(aluno);
    } catch (err) {
      if (err instanceof AlunoValidationError) {
        return reply.code(400).send({ error: err.message });
      }
      throw err;
    }
  });

  app.put<{ Params: { id: string }; Body: UpdateAlunoInput }>(
    "/alunos/:id",
    auth,
    async (request, reply) => {
      try {
        return await alunoService.update(request.params.id, request.body);
      } catch (err) {
        if (err instanceof AlunoNotFoundError) {
          return reply.code(404).send({ error: "Aluno não encontrado" });
        }
        if (err instanceof AlunoValidationError) {
          return reply.code(400).send({ error: err.message });
        }
        throw err;
      }
    }
  );

  app.delete<{ Params: { id: string } }>("/alunos/:id", auth, async (request, reply) => {
    try {
      return await alunoService.remove(request.params.id);
    } catch (err) {
      if (err instanceof AlunoNotFoundError) {
        return reply.code(404).send({ error: "Aluno não encontrado" });
      }
      throw err;
    }
  });
}
