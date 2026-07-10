import { Table } from "../../../shared/components/Table.js";
import { Button } from "../../../shared/components/Button.js";
import type { Escola } from "../types.js";

interface EscolaListProps {
  escolas: Escola[];
  onEdit: (escola: Escola) => void;
  onRemove: (id: string) => void;
}

export function EscolaList({ escolas, onEdit, onRemove }: EscolaListProps) {
  return (
    <div>
      <Table<Escola>
        columns={[{ key: "nome", header: "Nome" }]}
        rows={escolas}
        rowKey={(e) => e.id}
      />
      {escolas.map((e) => (
        <div key={e.id}>
          <Button onClick={() => onEdit(e)}>Editar</Button>
          <Button onClick={() => onRemove(e.id)}>Remover</Button>
        </div>
      ))}
    </div>
  );
}
