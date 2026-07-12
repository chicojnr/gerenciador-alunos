import { Trash2 } from "lucide-react";
import { Table } from "../../../shared/components/Table.js";
import { Button } from "../../../shared/components/Button.js";
import type { DiaNaoLetivo, TipoDiaNaoLetivo } from "../types.js";

interface DiaNaoLetivoListProps {
  dias: DiaNaoLetivo[];
  onRemove: (id: string) => void;
}

const TIPO_LABEL: Record<TipoDiaNaoLetivo, string> = {
  FERIADO: "Feriado",
  PONTE: "Ponte",
  FERIAS: "Férias"
};

export function DiaNaoLetivoList({ dias, onRemove }: DiaNaoLetivoListProps) {
  return (
    <Table<DiaNaoLetivo>
      columns={[
        { key: "data", header: "Data" },
        { key: "tipo", header: "Tipo", render: (d) => TIPO_LABEL[d.tipo] },
        { key: "descricao", header: "Descrição", render: (d) => d.descricao ?? "—" },
        {
          key: "acoes",
          header: "Ações",
          render: (d) => (
            <Button variant="danger" onClick={() => onRemove(d.id)}>
              <Trash2 className="mr-1.5 h-3.5 w-3.5" strokeWidth={2} />
              Remover
            </Button>
          )
        }
      ]}
      rows={dias}
      rowKey={(d) => d.id}
    />
  );
}
