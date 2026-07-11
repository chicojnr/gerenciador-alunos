import { Pencil, Trash2, ShieldCheck } from "lucide-react";
import { Table } from "../../../shared/components/Table.js";
import { Button } from "../../../shared/components/Button.js";
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
        { key: "name", header: "Nome" },
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
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => onEdit(usuario)}>
                <Pencil className="mr-1.5 h-3.5 w-3.5" strokeWidth={2} />
                Editar
              </Button>
              <Button variant="danger" onClick={() => onRemove(usuario.id)}>
                <Trash2 className="mr-1.5 h-3.5 w-3.5" strokeWidth={2} />
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
