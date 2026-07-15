import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ResponsavelList } from "./ResponsavelList.js";
import type { Responsavel } from "../types.js";

describe("ResponsavelList", () => {
  it("renders responsaveis and calls onEdit/onRemove when clicked", () => {
    const responsaveis: Responsavel[] = [
      { id: "1", nome: "Mae Fulana", telefone: "11999999999", email: null, ativo: true }
    ];
    const onEdit = vi.fn();
    const onRemove = vi.fn();

    render(<ResponsavelList responsaveis={responsaveis} onEdit={onEdit} onRemove={onRemove} />);

    expect(screen.getByText("Mae Fulana")).toBeTruthy();

    fireEvent.click(screen.getByText("Mae Fulana"));
    expect(onEdit).toHaveBeenCalledWith(responsaveis[0]);

    fireEvent.click(screen.getByText("Remover"));
    expect(onRemove).toHaveBeenCalledWith("1");
  });
});
