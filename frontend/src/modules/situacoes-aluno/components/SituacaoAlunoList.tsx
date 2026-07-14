import { Pencil, Trash2 } from "lucide-react";
import { Table } from "../../../shared/components/Table.js";
import { Button } from "../../../shared/components/Button.js";
import type { SituacaoAluno } from "../types.js";

interface SituacaoAlunoListProps {
  situacoes: SituacaoAluno[];
  onEdit: (situacao: SituacaoAluno) => void;
  onRemove: (id: string) => void;
}

export function SituacaoAlunoList({ situacoes, onEdit, onRemove }: SituacaoAlunoListProps) {
  return (
    <Table<SituacaoAluno>
      columns={[
        { key: "nome", header: "Nome" },
        {
          key: "acoes",
          header: "Ações",
          render: (situacao) => (
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => onEdit(situacao)}>
                <Pencil className="mr-1.5 h-3.5 w-3.5" strokeWidth={2} />
                Editar
              </Button>
              <Button variant="danger" onClick={() => onRemove(situacao.id)}>
                <Trash2 className="mr-1.5 h-3.5 w-3.5" strokeWidth={2} />
                Remover
              </Button>
            </div>
          )
        }
      ]}
      rows={situacoes}
      rowKey={(s) => s.id}
    />
  );
}
