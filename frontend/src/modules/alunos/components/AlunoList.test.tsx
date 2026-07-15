import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { AlunoList } from "./AlunoList.js";
import type { Aluno } from "../types.js";

describe("AlunoList", () => {
  it("renders alunos with their turma and calls onEdit/onRemove", () => {
    const alunos: Aluno[] = [
      {
        id: "1",
        nome: "Fulano",
        dataNascimento: null,
        turma: { id: "t1", nome: "Turma A" },
        situacaoAtual: { id: "s1", nome: "Ativo" },
        ativo: true
      }
    ];
    const onEdit = vi.fn();
    const onRemove = vi.fn();

    render(<AlunoList alunos={alunos} onEdit={onEdit} onRemove={onRemove} />);

    expect(screen.getByText("Fulano")).toBeTruthy();
    expect(screen.getByText("Turma A")).toBeTruthy();

    fireEvent.click(screen.getByText("Fulano"));
    expect(onEdit).toHaveBeenCalledWith(alunos[0]);

    fireEvent.click(screen.getByText("Remover"));
    expect(onRemove).toHaveBeenCalledWith("1");
  });
});
