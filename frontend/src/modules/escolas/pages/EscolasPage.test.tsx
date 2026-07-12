import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { EscolasPage } from "./EscolasPage.js";
import { escolasService } from "../services/escolas.service.js";
import { ConfirmProvider } from "../../../shared/contexts/ConfirmContext.js";
import type { Escola } from "../types.js";

vi.mock("../services/escolas.service.js", () => ({
  escolasService: {
    list: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn()
  }
}));

const listMock = vi.mocked(escolasService.list);
const createMock = vi.mocked(escolasService.create);

describe("EscolasPage", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    listMock.mockResolvedValue({ items: [], total: 0 });
  });

  it("keeps the modal open and shows an error when create fails", async () => {
    createMock.mockRejectedValueOnce(new Error("Request failed: 400"));

    render(
      <ConfirmProvider>
        <EscolasPage />
      </ConfirmProvider>
    );
    await waitFor(() => expect(screen.getByText("Nova Escola")).toBeTruthy());

    fireEvent.click(screen.getByText("Nova Escola"));
    fireEvent.change(screen.getByPlaceholderText("Nome da escola"), {
      target: { value: "Escola Falha" }
    });
    fireEvent.click(screen.getByText("Adicionar"));

    await waitFor(() => expect(screen.getByRole("alert")).toBeTruthy());
    expect(screen.getByRole("dialog")).toBeTruthy();
    expect(listMock).toHaveBeenCalledTimes(1);
  });

  it("closes the modal and refreshes the list when create succeeds", async () => {
    const created: Escola = {
      id: "1",
      nome: "Escola Ok",
      cnpj: null,
      endereco: null,
      telefone: null,
      ativo: true
    };
    createMock.mockResolvedValueOnce(created);

    render(
      <ConfirmProvider>
        <EscolasPage />
      </ConfirmProvider>
    );
    await waitFor(() => expect(screen.getByText("Nova Escola")).toBeTruthy());

    fireEvent.click(screen.getByText("Nova Escola"));
    fireEvent.change(screen.getByPlaceholderText("Nome da escola"), {
      target: { value: "Escola Ok" }
    });
    fireEvent.click(screen.getByText("Adicionar"));

    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    expect(listMock).toHaveBeenCalledTimes(2);
  });
});
