import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { TemplateList } from "./TemplateList.js";
import type { Template } from "../types.js";

describe("TemplateList", () => {
  it("renders templates and calls onEdit/onRemove when clicked", () => {
    const templates: Template[] = [
      { id: "1", nome: "Alerta", conteudo: "Olá {responsavel}", ativo: true }
    ];
    const onEdit = vi.fn();
    const onRemove = vi.fn();

    render(<TemplateList templates={templates} onEdit={onEdit} onRemove={onRemove} />);

    expect(screen.getByText("Alerta")).toBeTruthy();

    fireEvent.click(screen.getByText("Editar"));
    expect(onEdit).toHaveBeenCalledWith(templates[0]);

    fireEvent.click(screen.getByText("Remover"));
    expect(onRemove).toHaveBeenCalledWith("1");
  });
});
