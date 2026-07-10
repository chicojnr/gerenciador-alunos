import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MateriaList } from "./MateriaList.js";
import type { Materia } from "../types.js";

describe("MateriaList", () => {
  it("renders materias and calls onEdit/onRemove when clicked", () => {
    const materias: Materia[] = [{ id: "1", nome: "Matemática", ativo: true }];
    const onEdit = vi.fn();
    const onRemove = vi.fn();

    render(<MateriaList materias={materias} onEdit={onEdit} onRemove={onRemove} />);

    expect(screen.getByText("Matemática")).toBeTruthy();

    fireEvent.click(screen.getByText("Editar"));
    expect(onEdit).toHaveBeenCalledWith(materias[0]);

    fireEvent.click(screen.getByText("Remover"));
    expect(onRemove).toHaveBeenCalledWith("1");
  });
});
