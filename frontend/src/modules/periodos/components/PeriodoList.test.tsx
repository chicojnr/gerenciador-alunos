import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { PeriodoList } from "./PeriodoList.js";
import type { Periodo } from "../types.js";

describe("PeriodoList", () => {
  it("renders periodos and calls onEdit/onRemove when clicked", () => {
    const periodos: Periodo[] = [{ id: "1", nome: "Diurno", ativo: true }];
    const onEdit = vi.fn();
    const onRemove = vi.fn();

    render(<PeriodoList periodos={periodos} onEdit={onEdit} onRemove={onRemove} />);

    expect(screen.getByText("Diurno")).toBeTruthy();

    fireEvent.click(screen.getByText("Editar"));
    expect(onEdit).toHaveBeenCalledWith(periodos[0]);

    fireEvent.click(screen.getByText("Remover"));
    expect(onRemove).toHaveBeenCalledWith("1");
  });
});
