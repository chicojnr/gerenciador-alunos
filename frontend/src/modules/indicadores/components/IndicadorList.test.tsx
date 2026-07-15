import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { IndicadorList } from "./IndicadorList.js";
import type { Indicador } from "../types.js";

describe("IndicadorList", () => {
  it("renders indicadores with a readable rule description and calls onEdit/onRemove", () => {
    const indicadores: Indicador[] = [
      {
        id: "1",
        nome: "3 dias seguidos",
        tipo: "CONSECUTIVAS",
        quantidade: 3,
        janelaDias: null,
        escolaId: "escola-1",
        escola: { id: "escola-1", nome: "Escola Central" },
        ativo: true
      }
    ];
    const onEdit = vi.fn();
    const onRemove = vi.fn();

    render(<IndicadorList indicadores={indicadores} onEdit={onEdit} onRemove={onRemove} />);

    expect(screen.getByText("3 dias seguidos")).toBeTruthy();
    expect(screen.getByText("3 dias consecutivos")).toBeTruthy();

    fireEvent.click(screen.getByText("3 dias seguidos"));
    expect(onEdit).toHaveBeenCalledWith(indicadores[0]);

    fireEvent.click(screen.getByText("Remover"));
    expect(onRemove).toHaveBeenCalledWith("1");
  });
});
