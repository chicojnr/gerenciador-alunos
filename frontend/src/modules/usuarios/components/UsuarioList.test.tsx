import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { UsuarioList } from "./UsuarioList.js";
import type { Usuario } from "../types.js";

describe("UsuarioList", () => {
  it("renders usuarios and calls onEdit/onRemove when clicked", () => {
    const usuarios: Usuario[] = [
      { id: "1", name: "Fulano", email: "fulano@example.com", role: "USER", ativo: true }
    ];
    const onEdit = vi.fn();
    const onRemove = vi.fn();

    render(<UsuarioList usuarios={usuarios} onEdit={onEdit} onRemove={onRemove} />);

    expect(screen.getByText("Fulano")).toBeTruthy();
    expect(screen.getByText("fulano@example.com")).toBeTruthy();
    expect(screen.getByText("Usuário")).toBeTruthy();

    fireEvent.click(screen.getByText("Editar"));
    expect(onEdit).toHaveBeenCalledWith(usuarios[0]);

    fireEvent.click(screen.getByText("Desativar"));
    expect(onRemove).toHaveBeenCalledWith("1");
  });
});
