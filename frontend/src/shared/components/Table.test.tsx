import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Table } from "./Table.js";

interface Row {
  id: string;
  nome: string;
}

describe("Table", () => {
  it("renders headers and row values", () => {
    const rows: Row[] = [{ id: "1", nome: "Escola A" }];
    render(
      <Table<Row> columns={[{ key: "nome", header: "Nome" }]} rows={rows} rowKey={(r) => r.id} />
    );

    expect(screen.getByText("Nome")).toBeTruthy();
    expect(screen.getByText("Escola A")).toBeTruthy();
  });

  it("shows an empty state when there are no rows", () => {
    render(<Table<Row> columns={[{ key: "nome", header: "Nome" }]} rows={[]} rowKey={(r) => r.id} />);

    expect(screen.getByText("Nenhum registro encontrado.")).toBeTruthy();
  });
});
