import { useState } from "react";
import { Bell, Plus } from "lucide-react";
import { useIndicadores } from "../hooks/useIndicadores.js";
import { IndicadorForm } from "../components/IndicadorForm.js";
import { IndicadorList } from "../components/IndicadorList.js";
import { Modal } from "../../../shared/components/Modal.js";
import { Button } from "../../../shared/components/Button.js";
import type { Indicador, CreateIndicadorInput } from "../types.js";

export function IndicadoresPage() {
  const { indicadores, loading, create, update, remove } = useIndicadores();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Indicador | null>(null);

  if (loading) {
    return <p className="text-zinc-500">Carregando...</p>;
  }

  function openCreate() {
    setEditing(null);
    setModalOpen(true);
  }

  function openEdit(indicador: Indicador) {
    setEditing(indicador);
    setModalOpen(true);
  }

  async function handleSubmit(data: CreateIndicadorInput) {
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
        <div className="flex items-center gap-2.5">
          <Bell className="h-5 w-5 text-zinc-400" strokeWidth={2} />
          <h1 className="text-xl font-semibold text-zinc-900">Indicadores de Falta</h1>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-1.5 h-4 w-4" strokeWidth={2.25} />
          Novo Indicador
        </Button>
      </div>
      <IndicadorList indicadores={indicadores} onEdit={openEdit} onRemove={remove} />
      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <IndicadorForm
          initial={
            editing
              ? {
                  nome: editing.nome,
                  tipo: editing.tipo,
                  quantidade: editing.quantidade,
                  janelaDias: editing.janelaDias ?? undefined
                }
              : undefined
          }
          submitLabel={editing ? "Salvar" : "Adicionar"}
          onSubmit={handleSubmit}
        />
      </Modal>
    </div>
  );
}
