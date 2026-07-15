import { Trash2 } from "lucide-react";
import { Table } from "../../../shared/components/Table.js";
import { Button } from "../../../shared/components/Button.js";
import { ClickableCell } from "../../../shared/components/ClickableCell.js";
import type { Template } from "../types.js";

interface TemplateListProps {
  templates: Template[];
  onEdit: (template: Template) => void;
  onRemove: (id: string) => void;
}

export function TemplateList({ templates, onEdit, onRemove }: TemplateListProps) {
  return (
    <Table<Template>
      columns={[
        {
          key: "nome",
          header: "Nome",
          render: (t) => <ClickableCell text={t.nome} onClick={() => onEdit(t)} />
        },
        {
          key: "conteudo",
          header: "Conteúdo",
          render: (t) => (t.conteudo.length > 60 ? `${t.conteudo.slice(0, 60)}…` : t.conteudo)
        },
        {
          key: "acoes",
          header: "Ações",
          render: (template) => (
            <div className="flex justify-end gap-2">
              <Button variant="danger" size="sm" onClick={() => onRemove(template.id)}>
                <Trash2 className="mr-1 h-3 w-3" strokeWidth={2} />
                Remover
              </Button>
            </div>
          )
        }
      ]}
      rows={templates}
      rowKey={(t) => t.id}
    />
  );
}
