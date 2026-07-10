import { useState } from "react";
import { useUsuarios } from "../hooks/useUsuarios.js";
import { UsuarioForm } from "../components/UsuarioForm.js";
import { UsuarioList } from "../components/UsuarioList.js";
import { Modal } from "../../../shared/components/Modal.js";
import { Button } from "../../../shared/components/Button.js";
import type { Usuario, CreateUsuarioInput, UpdateUsuarioInput } from "../types.js";

export function UsuariosPage() {
  const { usuarios, loading, create, update, remove } = useUsuarios();
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
      await update(editing.id, data as UpdateUsuarioInput);
    } else {
      await create(data as CreateUsuarioInput);
    }
    setModalOpen(false);
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-zinc-900">Usuários</h1>
        <Button onClick={openCreate}>Novo Usuário</Button>
      </div>
      <UsuarioList usuarios={usuarios} onEdit={openEdit} onRemove={remove} />
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
