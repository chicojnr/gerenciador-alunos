import { describe, it, expect } from "vitest";
import { sequenciaAteMaisRecente, faltasNaJanela } from "./indicadores.engine.js";

function d(iso: string): Date {
  return new Date(iso);
}

describe("sequenciaAteMaisRecente", () => {
  it("returns 0 when there are no faltas", () => {
    expect(sequenciaAteMaisRecente([])).toBe(0);
  });

  it("returns 1 for a single falta", () => {
    expect(sequenciaAteMaisRecente([d("2026-07-10")])).toBe(1);
  });

  it("counts consecutive days ending at the most recent falta", () => {
    expect(
      sequenciaAteMaisRecente([d("2026-07-08"), d("2026-07-09"), d("2026-07-10")])
    ).toBe(3);
  });

  it("stops the streak at a gap", () => {
    expect(
      sequenciaAteMaisRecente([d("2026-07-05"), d("2026-07-06"), d("2026-07-09"), d("2026-07-10")])
    ).toBe(2);
  });

  it("ignores duplicate dates", () => {
    expect(
      sequenciaAteMaisRecente([d("2026-07-10"), d("2026-07-10"), d("2026-07-09")])
    ).toBe(2);
  });

  it("does not count an old streak once broken", () => {
    // 5 faltas seguidas antigas, depois voltou, depois 1 falta isolada recente
    expect(
      sequenciaAteMaisRecente([
        d("2026-06-01"),
        d("2026-06-02"),
        d("2026-06-03"),
        d("2026-06-04"),
        d("2026-06-05"),
        d("2026-07-10")
      ])
    ).toBe(1);
  });
});

describe("faltasNaJanela", () => {
  it("returns 0 when there are no faltas", () => {
    expect(faltasNaJanela([], 30, d("2026-07-10"))).toBe(0);
  });

  it("counts faltas inside the window, inclusive of the reference day", () => {
    expect(
      faltasNaJanela([d("2026-07-10"), d("2026-07-01"), d("2026-06-20")], 30, d("2026-07-10"))
    ).toBe(3);
  });

  it("excludes faltas older than the window", () => {
    // janela de 7 dias terminando em 10/07 => começa em 04/07
    expect(
      faltasNaJanela([d("2026-07-10"), d("2026-07-04"), d("2026-07-03")], 7, d("2026-07-10"))
    ).toBe(2);
  });

  it("counts each day only once even with duplicates", () => {
    expect(
      faltasNaJanela([d("2026-07-10"), d("2026-07-10"), d("2026-07-09")], 30, d("2026-07-10"))
    ).toBe(2);
  });
});
