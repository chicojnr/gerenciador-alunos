import type { FastifyInstance } from "fastify";
import { materiaService, MateriaNotFoundError, MateriaValidationError } from "./materias.service.js";
import { materiaImportService } from "./materias-import.service.js";
import { MateriaImportParseError } from "./materias-import.parser.js";
import { requireAuth } from "../../core/auth-hook.js";
import type { Config } from "../../core/config.js";
import type { CreateMateriaInput, UpdateMateriaInput } from "./materias.types.js";

export function registerMateriasRoutes(app: FastifyInstance, config: Config) {
  const auth = { preHandler: requireAuth(config) };

  app.get<{ Querystring: { page?: string; pageSize?: string } }>(
    "/materias",
    auth,
    async (request) => {
      const page = Number(request.query.page ?? 1);
      const pageSize = Number(request.query.pageSize ?? 20);
      return materiaService.list(page, pageSize);
    }
  );

  app.get<{ Params: { id: string } }>("/materias/:id", auth, async (request, reply) => {
    try {
      return await materiaService.getById(request.params.id);
    } catch (err) {
      if (err instanceof MateriaNotFoundError) {
        return reply.code(404).send({ error: "Disciplina não encontrada" });
      }
      throw err;
    }
  });

  app.post<{ Body: CreateMateriaInput }>("/materias", auth, async (request, reply) => {
    try {
      const materia = await materiaService.create(request.body);
      return reply.code(201).send(materia);
    } catch (err) {
      if (err instanceof MateriaValidationError) {
        return reply.code(400).send({ error: err.message });
      }
      throw err;
    }
  });

  app.put<{ Params: { id: string }; Body: UpdateMateriaInput }>(
    "/materias/:id",
    auth,
    async (request, reply) => {
      try {
        return await materiaService.update(request.params.id, request.body);
      } catch (err) {
        if (err instanceof MateriaNotFoundError) {
          return reply.code(404).send({ error: "Disciplina não encontrada" });
        }
        if (err instanceof MateriaValidationError) {
          return reply.code(400).send({ error: err.message });
        }
        throw err;
      }
    }
  );

  app.post("/materias/import/parse", auth, async (request, reply) => {
    const file = await request.file();
    if (!file) {
      return reply.code(400).send({ error: "arquivo PDF é obrigatório" });
    }
    const buffer = await file.toBuffer();
    try {
      const items = await materiaImportService.preview(buffer);
      return { items };
    } catch (err) {
      if (err instanceof MateriaImportParseError) {
        return reply.code(422).send({ error: err.message });
      }
      throw err;
    }
  });

  app.post<{ Body: { items: { nome: string; codigo: string }[] } }>(
    "/materias/import/confirm",
    auth,
    async (request, reply) => {
      const items = request.body?.items;
      if (!Array.isArray(items) || items.length === 0) {
        return reply.code(400).send({ error: "nenhum item selecionado" });
      }
      return materiaImportService.confirm(items);
    }
  );

  app.delete<{ Params: { id: string } }>("/materias/:id", auth, async (request, reply) => {
    try {
      return await materiaService.remove(request.params.id);
    } catch (err) {
      if (err instanceof MateriaNotFoundError) {
        return reply.code(404).send({ error: "Disciplina não encontrada" });
      }
      throw err;
    }
  });
}
