import { indicadorRepository } from "./indicadores.repository.js";
import { faltaRepository } from "../faltas/faltas.repository.js";
import { sequenciaAteMaisRecente, faltasNaJanela } from "./indicadores.engine.js";
import type { CreateIndicadorInput, UpdateIndicadorInput } from "./indicadores.types.js";

export class IndicadorNotFoundError extends Error {}
export class IndicadorValidationError extends Error {}

// Faltas mais antigas que isso não influenciam nenhum indicador em uso —
// limita o volume carregado na avaliação.
const JANELA_MAXIMA_DIAS = 120;

function assertValid(data: CreateIndicadorInput | UpdateIndicadorInput) {
  if (data.nome !== undefined && data.nome.trim().length === 0) {
    throw new IndicadorValidationError("nome não pode ser vazio");
  }
  if (data.quantidade !== undefined && (!Number.isInteger(data.quantidade) || data.quantidade < 1)) {
    throw new IndicadorValidationError("quantidade deve ser um inteiro maior que zero");
  }
  if (data.tipo === "NAO_CONSECUTIVAS") {
    if (data.janelaDias === undefined || !Number.isInteger(data.janelaDias) || data.janelaDias < 1) {
      throw new IndicadorValidationError(
        "janela de dias é obrigatória para indicadores de faltas não consecutivas"
      );
    }
    if (data.janelaDias > JANELA_MAXIMA_DIAS) {
      throw new IndicadorValidationError(`janela de dias não pode exceder ${JANELA_MAXIMA_DIAS}`);
    }
  }
}

export const indicadorService = {
  list(page: number, pageSize: number) {
    return indicadorRepository.list(page, pageSize);
  },

  async getById(id: string) {
    const indicador = await indicadorRepository.findById(id);
    if (!indicador) {
      throw new IndicadorNotFoundError(id);
    }
    return indicador;
  },

  async create(data: CreateIndicadorInput) {
    assertValid(data);
    return indicadorRepository.create(data);
  },

  async update(id: string, data: UpdateIndicadorInput) {
    assertValid(data);
    await this.getById(id);
    return indicadorRepository.update(id, data);
  },

  async remove(id: string) {
    await this.getById(id);
    return indicadorRepository.softDelete(id);
  },

  async avaliar(referencia: Date = new Date()) {
    const indicadores = await indicadorRepository.listAtivos();
    if (indicadores.length === 0) {
      return [];
    }

    const desde = new Date(referencia.getTime() - JANELA_MAXIMA_DIAS * 86_400_000);
    const faltas = await faltaRepository.listSince(desde);

    const porAluno = new Map<
      string,
      { aluno: (typeof faltas)[number]["aluno"]; datas: Date[] }
    >();
    for (const falta of faltas) {
      const atual = porAluno.get(falta.alunoId);
      if (atual) {
        atual.datas.push(falta.data);
      } else {
        porAluno.set(falta.alunoId, { aluno: falta.aluno, datas: [falta.data] });
      }
    }

    return indicadores.map((indicador) => {
      const alunos = [];
      for (const { aluno, datas } of porAluno.values()) {
        const valor =
          indicador.tipo === "CONSECUTIVAS"
            ? sequenciaAteMaisRecente(datas)
            : faltasNaJanela(datas, indicador.janelaDias ?? 30, referencia);
        if (valor >= indicador.quantidade) {
          alunos.push({ ...aluno, faltas: valor });
        }
      }
      alunos.sort((a, b) => b.faltas - a.faltas || a.nome.localeCompare(b.nome));
      return { indicador, alunos };
    });
  }
};
