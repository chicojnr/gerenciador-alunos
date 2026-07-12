import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { DiaNaoLetivoList } from "./DiaNaoLetivoList.js";
import type { DiaNaoLetivo } from "../types.js";

describe("DiaNaoLetivoList", () => {
  it("renders dias não letivos and calls onRemove when clicked", () => {
    const dias: DiaNaoLetivo[] = [
      {
        id: "1",
        escolaId: "escola-1",
        data: "2026-09-07",
        tipo: "FERIADO",
        descricao: "Independência"
      }
    ];
    const onRemove = vi.fn();

    render(<DiaNaoLetivoList dias={dias} onRemove={onRemove} />);

    expect(screen.getByText("2026-09-07")).toBeTruthy();
    expect(screen.getByText("Feriado")).toBeTruthy();

    fireEvent.click(screen.getByText("Remover"));
    expect(onRemove).toHaveBeenCalledWith("1");
  });
});
