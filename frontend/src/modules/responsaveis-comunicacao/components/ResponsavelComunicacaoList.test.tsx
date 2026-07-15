import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ResponsavelComunicacaoList } from "./ResponsavelComunicacaoList.js";
import type { ResponsavelComunicacao } from "../types.js";

describe("ResponsavelComunicacaoList", () => {
  it("renders items and calls onEdit/onRemove when clicked", () => {
    const items: ResponsavelComunicacao[] = [
      {
        id: "1",
        userId: "u1",
        user: { id: "u1", name: "Coordenador", email: "coordenador@example.com" },
        telefone: null,
        escola: { id: "e1", nome: "Escola A" },
        ativo: true
      }
    ];
    const onEdit = vi.fn();
    const onRemove = vi.fn();

    render(<ResponsavelComunicacaoList items={items} onEdit={onEdit} onRemove={onRemove} />);

    expect(screen.getByText("Coordenador")).toBeTruthy();
    expect(screen.getByText("coordenador@example.com")).toBeTruthy();

    fireEvent.click(screen.getByText("Coordenador"));
    expect(onEdit).toHaveBeenCalledWith(items[0]);

    fireEvent.click(screen.getByText("Remover"));
    expect(onRemove).toHaveBeenCalledWith("1");
  });
});
