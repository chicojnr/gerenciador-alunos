import { describe, it, expect } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ConfirmProvider, useConfirm } from "./ConfirmContext.js";

function TestHarness() {
  const confirm = useConfirm();
  return (
    <button
      onClick={async () => {
        const ok = await confirm({ title: "Remover?", message: "Tem certeza?", variant: "danger" });
        document.title = ok ? "confirmed" : "cancelled";
      }}
    >
      Trigger
    </button>
  );
}

describe("ConfirmContext", () => {
  it("resolves true when the confirm button is clicked", async () => {
    render(
      <ConfirmProvider>
        <TestHarness />
      </ConfirmProvider>
    );

    fireEvent.click(screen.getByText("Trigger"));
    expect(await screen.findByText("Remover?")).toBeTruthy();

    fireEvent.click(screen.getByText("Confirmar"));
    await waitFor(() => expect(document.title).toBe("confirmed"));
  });

  it("resolves false when cancelled", async () => {
    render(
      <ConfirmProvider>
        <TestHarness />
      </ConfirmProvider>
    );

    fireEvent.click(screen.getByText("Trigger"));
    expect(await screen.findByText("Remover?")).toBeTruthy();

    fireEvent.click(screen.getByText("Cancelar"));
    await waitFor(() => expect(document.title).toBe("cancelled"));
  });
});
