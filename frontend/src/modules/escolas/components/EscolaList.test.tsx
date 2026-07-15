import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { EscolaList } from "./EscolaList.js";
import type { Escola } from "../types.js";

describe("EscolaList", () => {
  it("renders escolas and calls onEdit/onRemove when clicked", () => {
    const escolas: Escola[] = [
      { id: "1", nome: "Escola A", cnpj: null, endereco: null, telefone: null, ativo: true }
    ];
    const onEdit = vi.fn();
    const onRemove = vi.fn();

    render(<EscolaList escolas={escolas} onEdit={onEdit} onRemove={onRemove} />);

    expect(screen.getByText("Escola A")).toBeTruthy();

    fireEvent.click(screen.getByText("Escola A"));
    expect(onEdit).toHaveBeenCalledWith(escolas[0]);

    fireEvent.click(screen.getByText("Remover"));
    expect(onRemove).toHaveBeenCalledWith("1");
  });
});
