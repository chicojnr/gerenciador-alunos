import { useState } from "react";
import { useMaterias } from "../hooks/useMaterias.js";
import { MateriaForm } from "../components/MateriaForm.js";
import { MateriaList } from "../components/MateriaList.js";
import { Modal } from "../../../shared/components/Modal.js";
import { Button } from "../../../shared/components/Button.js";
import type { Materia, CreateMateriaInput } from "../types.js";

export function MateriasPage() {
  const { materias, loading, create, update, remove } = useMaterias();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Materia | null>(null);

  if (loading) {
    return <p className="text-zinc-500">Carregando...</p>;
  }

  function openCreate() {
    setEditing(null);
    setModalOpen(true);
  }

  function openEdit(materia: Materia) {
    setEditing(materia);
    setModalOpen(true);
  }

  async function handleSubmit(data: CreateMateriaInput) {
    if (editing) {
      await update(editing.id, data);
    } else {
      await create(data);
    }
    setModalOpen(false);
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-zinc-900">Matérias</h1>
        <Button onClick={openCreate}>Nova Matéria</Button>
      </div>
      <MateriaList materias={materias} onEdit={openEdit} onRemove={remove} />
      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <MateriaForm
          initial={editing ? { nome: editing.nome } : undefined}
          submitLabel={editing ? "Salvar" : "Adicionar"}
          onSubmit={handleSubmit}
        />
      </Modal>
    </div>
  );
}
