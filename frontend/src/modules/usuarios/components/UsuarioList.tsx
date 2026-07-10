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
          render: (usuario) => (usuario.role === "ADMIN" ? "Admin" : "Usuário")
        },
        {
          key: "acoes",
          header: "Ações",
          render: (usuario) => (
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => onEdit(usuario)}>
                Editar
              </Button>
              <Button variant="danger" onClick={() => onRemove(usuario.id)}>
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
