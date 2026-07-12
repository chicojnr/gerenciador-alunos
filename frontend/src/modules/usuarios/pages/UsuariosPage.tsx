import { useState } from "react";
import { Users, Plus } from "lucide-react";
import { useUsuarios } from "../hooks/useUsuarios.js";
import { UsuarioForm } from "../components/UsuarioForm.js";
import { UsuarioList } from "../components/UsuarioList.js";
import { Modal } from "../../../shared/components/Modal.js";
import { Button } from "../../../shared/components/Button.js";
import { useConfirm } from "../../../shared/contexts/ConfirmContext.js";
import type { Usuario, CreateUsuarioInput, UpdateUsuarioInput } from "../types.js";

export function UsuariosPage() {
  const { usuarios, loading, create, update, remove } = useUsuarios();
  const confirm = useConfirm();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Usuario | null>(null);

  if (loading) {
    return <p className="text-zinc-500">Carregando...</p>;
  }

  function openCreate() {
    setEditing(null);
    setModalOpen(true);
  }

  function openEdit(usuario: Usuario) {
    setEditing(usuario);
    setModalOpen(true);
  }

  async function handleSubmit(data: CreateUsuarioInput | UpdateUsuarioInput) {
    if (editing) {
      const ok = await confirm({
        title: "Salvar alterações",
        message: "Confirma a alteração deste usuário?",
        confirmLabel: "Salvar"
      });
      if (!ok) {
        return;
      }
      await update(editing.id, data as UpdateUsuarioInput);
    } else {
      await create(data as CreateUsuarioInput);
    }
    setModalOpen(false);
  }

  async function handleRemove(id: string) {
    const ok = await confirm({
      title: "Remover usuário",
      message: "Tem certeza que deseja desativar este usuário?",
      confirmLabel: "Remover",
      variant: "danger"
    });
    if (ok) {
      await remove(id);
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Users className="h-5 w-5 text-zinc-400" strokeWidth={2} />
          <h1 className="text-xl font-semibold text-zinc-900">Usuários</h1>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-1.5 h-4 w-4" strokeWidth={2.25} />
          Novo Usuário
        </Button>
      </div>
      <UsuarioList usuarios={usuarios} onEdit={openEdit} onRemove={handleRemove} />
      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <UsuarioForm
          mode={editing ? "edit" : "create"}
          initial={editing ? { name: editing.name, role: editing.role } : undefined}
          submitLabel={editing ? "Salvar" : "Adicionar"}
          onSubmit={handleSubmit}
        />
      </Modal>
    </div>
  );
}
