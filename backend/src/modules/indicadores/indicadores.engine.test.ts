import { describe, it, expect } from "vitest";
import { sequenciaAteMaisRecente, faltasNaJanela, toDiaNumero } from "./indicadores.engine.js";

function d(iso: string): Date {
  return new Date(iso);
}

describe("sequenciaAteMaisRecente", () => {
  it("returns 0 when there are no faltas", () => {
    expect(sequenciaAteMaisRecente([])).toBe(0);
  });

  it("returns 1 for a single falta", () => {
    expect(sequenciaAteMaisRecente([d("2026-07-10")], d("2026-07-10"))).toBe(1);
  });

  it("counts consecutive days ending at the most recent falta", () => {
    expect(
      sequenciaAteMaisRecente(
        [d("2026-07-08"), d("2026-07-09"), d("2026-07-10")],
        d("2026-07-10")
      )
    ).toBe(3);
  });

  it("stops the streak at a real gap between weekdays", () => {
    // 06/07 (Mon) -> 09/07 (Thu) pula Ter/Qua, que são dias letivos: quebra.
    expect(
      sequenciaAteMaisRecente(
        [d("2026-07-05"), d("2026-07-06"), d("2026-07-09"), d("2026-07-10")],
        d("2026-07-10")
      )
    ).toBe(2);
  });

  it("does not break the streak across a weekend", () => {
    // 03/07 (Fri) -> 06/07 (Mon): fim de semana no meio não quebra.
    expect(sequenciaAteMaisRecente([d("2026-07-03"), d("2026-07-06")], d("2026-07-06"))).toBe(2);
  });

  it("extends a streak that spans a full weekend on both sides", () => {
    // Qui, Sex, Seg, Ter — fim de semana entre Sex e Seg não quebra.
    expect(
      sequenciaAteMaisRecente(
        [d("2026-07-02"), d("2026-07-03"), d("2026-07-06"), d("2026-07-07")],
        d("2026-07-07")
      )
    ).toBe(4);
  });

  it("breaks the streak when a weekday between the weekend has no falta", () => {
    // 03/07 (Fri) -> 07/07 (Tue): Seg (06/07) é dia letivo sem falta, quebra.
    expect(sequenciaAteMaisRecente([d("2026-07-03"), d("2026-07-07")], d("2026-07-07"))).toBe(1);
  });

  it("ignores duplicate dates", () => {
    expect(
      sequenciaAteMaisRecente([d("2026-07-10"), d("2026-07-10"), d("2026-07-09")], d("2026-07-10"))
    ).toBe(2);
  });

  it("does not count an old streak once broken", () => {
    // 5 faltas seguidas antigas, depois voltou, depois 1 falta isolada recente
    expect(
      sequenciaAteMaisRecente(
        [
          d("2026-06-01"),
          d("2026-06-02"),
          d("2026-06-03"),
          d("2026-06-04"),
          d("2026-06-05"),
          d("2026-07-10")
        ],
        d("2026-07-10")
      )
    ).toBe(1);
  });

  it("still flags a streak within the grace period after the last falta", () => {
    // Última falta em 03/07 (Fri); avaliado em 06/07 (Mon) — 3 dias corridos, dentro da tolerância.
    expect(sequenciaAteMaisRecente([d("2026-07-01"), d("2026-07-02"), d("2026-07-03")], d("2026-07-06"))).toBe(
      3
    );
  });

  it("treats a streak as resolved once it falls outside the grace period", () => {
    // Última falta em 03/07 (Fri); avaliado em 07/07 (Tue) — 4 dias corridos, fora da tolerância.
    expect(
      sequenciaAteMaisRecente([d("2026-07-01"), d("2026-07-02"), d("2026-07-03")], d("2026-07-07"))
    ).toBe(0);
  });

  it("does not break the streak across an injected non-school day (feriado/ponte)", () => {
    // Feriado na quinta (09/07) e ponte na sexta (10/07): quarta -> segunda
    // deve encadear como sequência, não só o fim de semana.
    const feriadoOuPonte = new Set([toDiaNumero(d("2026-07-09")), toDiaNumero(d("2026-07-10"))]);
    const ehNaoLetivo = (dia: number) => {
      const diaSemana = new Date(dia * 86_400_000).getUTCDay();
      return diaSemana === 0 || diaSemana === 6 || feriadoOuPonte.has(dia);
    };
    expect(
      sequenciaAteMaisRecente([d("2026-07-08"), d("2026-07-13")], d("2026-07-13"), ehNaoLetivo)
    ).toBe(2);
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
