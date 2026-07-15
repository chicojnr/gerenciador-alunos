import { Trash2, ShieldCheck } from "lucide-react";
import { Table } from "../../../shared/components/Table.js";
import { Button } from "../../../shared/components/Button.js";
import { ClickableCell } from "../../../shared/components/ClickableCell.js";
import type { Usuario } from "../types.js";

interface UsuarioListProps {
  usuarios: Usuario[];
  onEdit: (usuario: Usuario) => void;
  onRemove: (id: string) => void;
}

export function UsuarioList({ usuarios, onEdit, onRemove }: UsuarioListProps) {
  return (
    <Table<Usuario>
      columns={[
        {
          key: "name",
          header: "Nome",
          render: (usuario) => <ClickableCell text={usuario.name} onClick={() => onEdit(usuario)} />
        },
        { key: "email", header: "Email" },
        {
          key: "role",
          header: "Papel",
          render: (usuario) =>
            usuario.role === "ADMIN" ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700">
                <ShieldCheck className="h-3 w-3" strokeWidth={2.25} />
                Admin
              </span>
            ) : (
              <span className="inline-flex items-center rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600">
                Usuário
              </span>
            )
        },
        {
          key: "acoes",
          header: "Ações",
          render: (usuario) => (
            <div className="flex justify-end gap-2">
              <Button variant="danger" size="sm" onClick={() => onRemove(usuario.id)}>
                <Trash2 className="mr-1 h-3 w-3" strokeWidth={2} />
                Desativar
              </Button>
            </div>
          )
        }
      ]}
      rows={usuarios}
      rowKey={(u) => u.id}
    />
  );
}
