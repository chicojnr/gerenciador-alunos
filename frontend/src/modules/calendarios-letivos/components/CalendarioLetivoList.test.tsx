import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CalendarioLetivoList } from "./CalendarioLetivoList.js";
import type { CalendarioLetivo } from "../types.js";

describe("CalendarioLetivoList", () => {
  it("renders calendarios and calls onEdit/onRemove when clicked", () => {
    const calendarios: CalendarioLetivo[] = [
      {
        id: "1",
        nome: "Ano Letivo 2026",
        dataInicio: "2026-02-01T00:00:00.000Z",
        dataFim: "2026-12-15T00:00:00.000Z",
        escola: { id: "e1", nome: "Escola A" },
        ativo: true
      }
    ];
    const onEdit = vi.fn();
    const onRemove = vi.fn();

    render(<CalendarioLetivoList calendarios={calendarios} onEdit={onEdit} onRemove={onRemove} />);

    expect(screen.getByText("Ano Letivo 2026")).toBeTruthy();
    expect(screen.getByText("Escola A")).toBeTruthy();

    fireEvent.click(screen.getByText("Ano Letivo 2026"));
    expect(onEdit).toHaveBeenCalledWith(calendarios[0]);

    fireEvent.click(screen.getByText("Remover"));
    expect(onRemove).toHaveBeenCalledWith("1");
  });
});
