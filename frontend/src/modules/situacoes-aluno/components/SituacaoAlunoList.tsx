import { Trash2 } from "lucide-react";
import { Table } from "../../../shared/components/Table.js";
import { Button } from "../../../shared/components/Button.js";
import { ClickableCell } from "../../../shared/components/ClickableCell.js";
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
        {
          key: "nome",
          header: "Nome",
          render: (situacao) => (
            <ClickableCell text={situacao.nome} onClick={() => onEdit(situacao)} />
          )
        },
        {
          key: "acoes",
          header: "Ações",
          render: (situacao) => (
            <div className="flex justify-end gap-2">
              <Button variant="danger" size="sm" onClick={() => onRemove(situacao.id)}>
                <Trash2 className="mr-1 h-3 w-3" strokeWidth={2} />
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
