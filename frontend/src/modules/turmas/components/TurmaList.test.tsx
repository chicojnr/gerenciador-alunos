import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { TurmaList } from "./TurmaList.js";
import type { Turma } from "../types.js";

describe("TurmaList", () => {
  it("renders turmas with escola/periodo and calls onEdit/onRemove", () => {
    const turmas: Turma[] = [
      {
        id: "1",
        nome: "Turma A",
        serie: "6º Ano",
        escola: { id: "e1", nome: "Escola A" },
        periodo: { id: "p1", nome: "Diurno" },
        ativo: true
      }
    ];
    const onEdit = vi.fn();
    const onRemove = vi.fn();

    render(<TurmaList turmas={turmas} onEdit={onEdit} onRemove={onRemove} />);

    expect(screen.getByText("Turma A")).toBeTruthy();
    expect(screen.getByText("Escola A")).toBeTruthy();
    expect(screen.getByText("Diurno")).toBeTruthy();

    fireEvent.click(screen.getByText("Editar"));
    expect(onEdit).toHaveBeenCalledWith(turmas[0]);

    fireEvent.click(screen.getByText("Remover"));
    expect(onRemove).toHaveBeenCalledWith("1");
  });
});
