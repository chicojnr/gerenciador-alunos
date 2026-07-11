import { calendarioLetivoRepository } from "./calendarios-letivos.repository.js";
import type {
  CreateCalendarioLetivoInput,
  UpdateCalendarioLetivoInput
} from "./calendarios-letivos.types.js";

export class CalendarioLetivoNotFoundError extends Error {}
export class CalendarioLetivoValidationError extends Error {}

function assertValid(data: {
  nome?: string;
  dataInicio?: string;
  dataFim?: string;
  escolaId?: string;
}) {
  if (data.nome !== undefined && data.nome.trim().length === 0) {
    throw new CalendarioLetivoValidationError("nome não pode ser vazio");
  }
  if (data.escolaId !== undefined && data.escolaId.trim().length === 0) {
    throw new CalendarioLetivoValidationError("escola é obrigatória");
  }
  if (data.dataInicio && data.dataFim && new Date(data.dataInicio) > new Date(data.dataFim)) {
    throw new CalendarioLetivoValidationError("data de início deve ser anterior à data de fim");
  }
}

export const calendarioLetivoService = {
  list(page: number, pageSize: number) {
    return calendarioLetivoRepository.list(page, pageSize);
  },

  async getById(id: string) {
    const calendario = await calendarioLetivoRepository.findById(id);
    if (!calendario) {
      throw new CalendarioLetivoNotFoundError(id);
    }
    return calendario;
  },

  async create(data: CreateCalendarioLetivoInput) {
    assertValid(data);
    return calendarioLetivoRepository.create(data);
  },

  async update(id: string, data: UpdateCalendarioLetivoInput) {
    assertValid(data);
    await this.getById(id);
    return calendarioLetivoRepository.update(id, data);
  },

  async remove(id: string) {
    await this.getById(id);
    return calendarioLetivoRepository.softDelete(id);
  }
};
