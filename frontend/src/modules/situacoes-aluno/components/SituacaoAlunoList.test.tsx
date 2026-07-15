import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { SituacaoAlunoList } from "./SituacaoAlunoList.js";
import type { SituacaoAluno } from "../types.js";

describe("SituacaoAlunoList", () => {
  it("renders situacoes and calls onEdit/onRemove when clicked", () => {
    const situacoes: SituacaoAluno[] = [{ id: "1", nome: "Ativo", ativo: true }];
    const onEdit = vi.fn();
    const onRemove = vi.fn();

    render(<SituacaoAlunoList situacoes={situacoes} onEdit={onEdit} onRemove={onRemove} />);

    expect(screen.getByText("Ativo")).toBeTruthy();

    fireEvent.click(screen.getByText("Ativo"));
    expect(onEdit).toHaveBeenCalledWith(situacoes[0]);

    fireEvent.click(screen.getByText("Remover"));
    expect(onRemove).toHaveBeenCalledWith("1");
  });
});
