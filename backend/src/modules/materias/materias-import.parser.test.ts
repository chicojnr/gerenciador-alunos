import { describe, it, expect } from "vitest";
import { extractFromPageItems, type PositionedToken } from "./materias-import.parser.js";

function tok(str: string, x: number, y: number): PositionedToken {
  return { str, x, y };
}

describe("extractFromPageItems", () => {
  it("groups wrapped header lines by nearest code column and joins them", () => {
    const items: PositionedToken[] = [
      tok("ALUNO", 50, 244),
      tok("SIT", 96, 244),
      tok("ARTE", 133, 244),
      tok("EDUCAÇAO", 221, 241),
      tok("FINANCEIRA", 220, 247),
      tok("ESPORTE-", 369, 241),
      tok("MUSICA-ARTE", 364, 247),
      tok("TOTAL", 1113, 244),
      tok("1813", 135, 263),
      tok("52000", 230, 263),
      tok("52003", 376, 263)
    ];

    const result = extractFromPageItems(items);

    expect(result).toEqual([
      { codigo: "1813", nome: "ARTE" },
      { codigo: "52000", nome: "EDUCAÇAO FINANCEIRA" },
      { codigo: "52003", nome: "ESPORTE-MUSICA-ARTE" }
    ]);
  });

  it("merges a leading-zero code fragment split into a separate text item", () => {
    const items: PositionedToken[] = [
      tok("ALUNO", 50, 244),
      tok("SIT", 96, 244),
      tok("ARTE", 133, 244),
      tok("BIOLOGIA", 175, 244),
      tok("TOTAL", 1113, 244),
      tok("0", 135, 263),
      tok("810", 140, 263),
      tok("2400", 183, 263)
    ];

    const result = extractFromPageItems(items);

    expect(result).toEqual([
      { codigo: "0810", nome: "ARTE" },
      { codigo: "2400", nome: "BIOLOGIA" }
    ]);
  });

  it("returns null when SIT/TOTAL header markers are not found", () => {
    const items: PositionedToken[] = [tok("ALUNO", 50, 244), tok("NOME", 96, 244)];
    expect(extractFromPageItems(items)).toBeNull();
  });
});
