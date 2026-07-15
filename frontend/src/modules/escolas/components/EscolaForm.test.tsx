import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { EscolaForm } from "./EscolaForm.js";

describe("EscolaForm", () => {
  it("calls onSubmit with the form data and clears the field on success", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);

    render(<EscolaForm submitLabel="Adicionar" onSubmit={onSubmit} onCancel={vi.fn()} />);

    fireEvent.change(screen.getByPlaceholderText("Nome da escola"), {
      target: { value: "Escola Nova" }
    });
    fireEvent.click(screen.getByText("Adicionar"));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith({ nome: "Escola Nova" }));
    await waitFor(() =>
      expect((screen.getByPlaceholderText("Nome da escola") as HTMLInputElement).value).toBe("")
    );
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("shows an error and keeps the field's value when onSubmit rejects", async () => {
    const onSubmit = vi.fn().mockRejectedValue(new Error("Request failed: 400"));

    render(<EscolaForm submitLabel="Adicionar" onSubmit={onSubmit} onCancel={vi.fn()} />);

    fireEvent.change(screen.getByPlaceholderText("Nome da escola"), {
      target: { value: "Escola Quebrada" }
    });
    fireEvent.click(screen.getByText("Adicionar"));

    await waitFor(() => expect(screen.getByRole("alert")).toBeTruthy());
    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect((screen.getByPlaceholderText("Nome da escola") as HTMLInputElement).value).toBe(
      "Escola Quebrada"
    );
  });

  it("clears a previous error on the next submit attempt", async () => {
    const onSubmit = vi.fn().mockRejectedValueOnce(new Error("fail")).mockResolvedValueOnce(undefined);

    render(<EscolaForm submitLabel="Adicionar" onSubmit={onSubmit} onCancel={vi.fn()} />);

    fireEvent.change(screen.getByPlaceholderText("Nome da escola"), {
      target: { value: "Escola Retry" }
    });
    fireEvent.click(screen.getByText("Adicionar"));
    await waitFor(() => expect(screen.getByRole("alert")).toBeTruthy());

    fireEvent.click(screen.getByText("Adicionar"));
    await waitFor(() => expect(screen.queryByRole("alert")).toBeNull());
    expect(onSubmit).toHaveBeenCalledTimes(2);
  });
});
