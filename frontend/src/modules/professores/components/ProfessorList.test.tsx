import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ProfessorList } from "./ProfessorList.js";
import type { Professor } from "../types.js";

describe("ProfessorList", () => {
  it("renders professores with their escola and calls onEdit/onRemove", () => {
    const professores: Professor[] = [
      {
        id: "1",
        nome: "Fulano",
        email: null,
        telefone: null,
        escola: { id: "e1", nome: "Escola A" },
        ativo: true
      }
    ];
    const onEdit = vi.fn();
    const onRemove = vi.fn();

    render(<ProfessorList professores={professores} onEdit={onEdit} onRemove={onRemove} />);

    expect(screen.getByText("Fulano")).toBeTruthy();
    expect(screen.getByText("Escola A")).toBeTruthy();

    fireEvent.click(screen.getByText("Fulano"));
    expect(onEdit).toHaveBeenCalledWith(professores[0]);

    fireEvent.click(screen.getByText("Remover"));
    expect(onRemove).toHaveBeenCalledWith("1");
  });
});
