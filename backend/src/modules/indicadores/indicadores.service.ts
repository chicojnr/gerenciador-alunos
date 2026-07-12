import { indicadorRepository } from "./indicadores.repository.js";
import { faltaRepository } from "../faltas/faltas.repository.js";
import { diaNaoLetivoRepository } from "../dias-nao-letivos/dias-nao-letivos.repository.js";
import { sequenciaAteMaisRecente, faltasNaJanela, toDiaNumero, ehFimDeSemana } from "./indicadores.engine.js";
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

function assertRequiredOnCreate(data: CreateIndicadorInput) {
  if (!data.nome || !data.nome.trim()) {
    throw new IndicadorValidationError("nome é obrigatório");
  }
  if (!data.tipo) {
    throw new IndicadorValidationError("tipo é obrigatório");
  }
  if (data.quantidade === undefined) {
    throw new IndicadorValidationError("quantidade é obrigatória");
  }
  if (!data.escolaId) {
    throw new IndicadorValidationError("escola é obrigatória");
  }
}

// "Hoje" no fuso horário do Brasil — evita que a virada de dia em UTC (21h em
// Brasília) mude a data de referência antes da hora local realmente virar.
function hojeBrasil(): Date {
  const partes = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(new Date());
  const valor = (tipo: string) => Number(partes.find((p) => p.type === tipo)!.value);
  return new Date(Date.UTC(valor("year"), valor("month") - 1, valor("day")));
}

export const indicadorService = {
  list(page: number, pageSize: number, escolaId?: string) {
    return indicadorRepository.list(page, pageSize, escolaId);
  },

  async getById(id: string) {
    const indicador = await indicadorRepository.findById(id);
    if (!indicador) {
      throw new IndicadorNotFoundError(id);
    }
    return indicador;
  },

  async create(data: CreateIndicadorInput) {
    assertRequiredOnCreate(data);
    assertValid(data);
    return indicadorRepository.create(data);
  },

  async update(id: string, data: UpdateIndicadorInput) {
    const existente = await this.getById(id);
    assertValid({ ...data, tipo: data.tipo ?? existente.tipo });
    return indicadorRepository.update(id, data);
  },

  async remove(id: string) {
    await this.getById(id);
    return indicadorRepository.softDelete(id);
  },

  async avaliar(referencia: Date = hojeBrasil()) {
    const indicadores = await indicadorRepository.listAtivos();
    if (indicadores.length === 0) {
      return [];
    }

    const desde = new Date(referencia.getTime() - JANELA_MAXIMA_DIAS * 86_400_000);
    const faltas = await faltaRepository.listSince(desde);

    // Agrupa faltas por escola (via turma do aluno) e depois por aluno —
    // cada escola tem seu próprio calendário de dias não letivos.
    const porEscola = new Map<
      string,
      Map<string, { aluno: (typeof faltas)[number]["aluno"]; datas: Date[] }>
    >();
    for (const falta of faltas) {
      const escolaId = falta.aluno.turma.escolaId;
      let porAluno = porEscola.get(escolaId);
      if (!porAluno) {
        porAluno = new Map();
        porEscola.set(escolaId, porAluno);
      }
      const atual = porAluno.get(falta.alunoId);
      if (atual) {
        atual.datas.push(falta.data);
      } else {
        porAluno.set(falta.alunoId, { aluno: falta.aluno, datas: [falta.data] });
      }
    }

    const escolaIds = [...new Set(indicadores.map((i) => i.escolaId))];
    const diasNaoLetivos = await diaNaoLetivoRepository.listByEscolas(escolaIds, desde);
    const naoLetivosPorEscola = new Map<string, Set<number>>();
    for (const dia of diasNaoLetivos) {
      const existente = naoLetivosPorEscola.get(dia.escolaId);
      const diaNumero = toDiaNumero(dia.data);
      if (existente) {
        existente.add(diaNumero);
      } else {
        naoLetivosPorEscola.set(dia.escolaId, new Set([diaNumero]));
      }
    }

    return indicadores.map((indicador) => {
      const excecoes = naoLetivosPorEscola.get(indicador.escolaId);
      const ehDiaNaoLetivo = excecoes
        ? (dia: number) => ehFimDeSemana(dia) || excecoes.has(dia)
        : ehFimDeSemana;

      const porAluno = porEscola.get(indicador.escolaId) ?? new Map();
      const alunos = [];
      for (const { aluno, datas } of porAluno.values()) {
        const valor =
          indicador.tipo === "CONSECUTIVAS"
            ? sequenciaAteMaisRecente(datas, referencia, ehDiaNaoLetivo)
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
