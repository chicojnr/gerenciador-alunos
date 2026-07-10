import { useState } from "react";
import { usePeriodos } from "../hooks/usePeriodos.js";
import { PeriodoForm } from "../components/PeriodoForm.js";
import { PeriodoList } from "../components/PeriodoList.js";
import { Modal } from "../../../shared/components/Modal.js";
import { Button } from "../../../shared/components/Button.js";
import type { Periodo, CreatePeriodoInput } from "../types.js";

export function PeriodosPage() {
  const { periodos, loading, create, update, remove } = usePeriodos();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Periodo | null>(null);

  if (loading) {
    return <p className="text-zinc-500">Carregando...</p>;
  }

  function openCreate() {
    setEditing(null);
    setModalOpen(true);
  }

  function openEdit(periodo: Periodo) {
    setEditing(periodo);
    setModalOpen(true);
  }

  async function handleSubmit(data: CreatePeriodoInput) {
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
        <h1 className="text-xl font-semibold text-zinc-900">Períodos</h1>
        <Button onClick={openCreate}>Novo Período</Button>
      </div>
      <PeriodoList periodos={periodos} onEdit={openEdit} onRemove={remove} />
      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <PeriodoForm
          initial={editing ? { nome: editing.nome } : undefined}
          submitLabel={editing ? "Salvar" : "Adicionar"}
          onSubmit={handleSubmit}
        />
      </Modal>
    </div>
  );
}
