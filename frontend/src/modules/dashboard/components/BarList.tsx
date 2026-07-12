interface BarListProps {
  items: { id: string; label: string; value: number }[];
  formatValue?: (value: number) => string;
  accentClassName?: string;
}

export function BarList({ items, formatValue, accentClassName = "bg-indigo-500" }: BarListProps) {
  if (items.length === 0) {
    return <p className="text-sm text-zinc-400">Sem dados ainda.</p>;
  }
  const max = Math.max(...items.map((i) => i.value), 1);

  return (
    <ul className="space-y-2.5">
      {items.map((item) => (
        <li key={item.id}>
          <div className="mb-1 flex items-center justify-between text-sm">
            <span className="text-zinc-700">{item.label}</span>
            <span className="tabular-nums font-medium text-zinc-900">
              {formatValue ? formatValue(item.value) : item.value}
            </span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-zinc-100">
            <div
              className={`h-1.5 rounded-full ${accentClassName}`}
              style={{ width: `${Math.max((item.value / max) * 100, 3)}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
