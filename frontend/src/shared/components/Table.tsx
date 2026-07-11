import { ReactNode } from "react";

interface Column<T> {
  key: keyof T | string;
  header: string;
  render?: (row: T) => ReactNode;
}

interface TableProps<T> {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
}

export function Table<T>({ columns, rows, rowKey }: TableProps<T>) {
  return (
    <table className="w-full border-separate border-spacing-0 overflow-hidden rounded-lg border border-zinc-200 text-sm">
      <thead className="bg-zinc-50">
        <tr>
          {columns.map((col) => (
            <th
              key={String(col.key)}
              className="border-b border-zinc-200 px-3 py-2 text-left font-medium text-zinc-600"
            >
              {col.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.length === 0 ? (
          <tr>
            <td colSpan={columns.length} className="px-3 py-8 text-center text-zinc-400">
              Nenhum registro encontrado.
            </td>
          </tr>
        ) : (
          rows.map((row) => (
            <tr key={rowKey(row)} className="transition-colors duration-150 hover:bg-zinc-50">
              {columns.map((col) => (
                <td
                  key={String(col.key)}
                  className="border-b border-zinc-100 px-3 py-2 text-zinc-800 last:border-b-0"
                >
                  {col.render ? col.render(row) : String(row[col.key as keyof T])}
                </td>
              ))}
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
}
