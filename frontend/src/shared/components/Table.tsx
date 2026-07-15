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
    <table className="w-full border-separate border-spacing-0 overflow-hidden rounded-lg border border-zinc-200 text-[13px] shadow-[0_1px_2px_rgba(34,28,17,0.05),0_2px_6px_rgba(34,28,17,0.04)]">
      <thead className="bg-zinc-100">
        <tr>
          {columns.map((col) => (
            <th
              key={String(col.key)}
              className="border-b border-zinc-200 px-3 py-1.5 text-left text-[11px] font-semibold uppercase tracking-wide text-zinc-600"
            >
              {col.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.length === 0 ? (
          <tr className="bg-white">
            <td colSpan={columns.length} className="px-3 py-8 text-center text-zinc-400">
              Nenhum registro encontrado.
            </td>
          </tr>
        ) : (
          rows.map((row) => (
            <tr
              key={rowKey(row)}
              className="group bg-white transition-colors duration-150 hover:bg-indigo-50/60"
            >
              {columns.map((col) => (
                <td
                  key={String(col.key)}
                  className="border-b border-zinc-100 px-3 py-0.5 text-zinc-700 group-last:border-b-0"
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
