import type { Option } from "../../shared/types.js";

export interface TurmaMateria {
  id: string;
  materia: Option;
  professor: Option;
}

export interface CreateTurmaMateriaInput {
  materiaId: string;
  professorId: string;
}
