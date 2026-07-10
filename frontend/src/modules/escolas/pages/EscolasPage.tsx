import { useState } from "react";
import { useEscolas } from "../hooks/useEscolas.js";
import { EscolaForm } from "../components/EscolaForm.js";
import { EscolaList } from "../components/EscolaList.js";
import { Modal } from "../../../shared/components/Modal.js";
import { Button } from "../../../shared/components/Button.js";
import type { Escola, CreateEscolaInput } from "../types.js";

export function EscolasPage() {
  const { escolas, loading, create, update, remove } = useEscolas();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Escola | null>(null);

  if (loading) {
    return <p>Carregando...</p>;
  }

  function openCreate() {
    setEditing(null);
    setModalOpen(true);
  }

  function openEdit(escola: Escola) {
    setEditing(escola);
    setModalOpen(true);
  }

  async function handleSubmit(data: CreateEscolaInput) {
    if (editing) {
      await update(editing.id, data);
    } else {
      await create(data);
    }
    setModalOpen(false);
  }

  return (
    <div>
      <h1>Escolas</h1>
      <Button onClick={openCreate}>Nova Escola</Button>
      <EscolaList escolas={escolas} onEdit={openEdit} onRemove={remove} />
      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <EscolaForm
          initial={editing ? { nome: editing.nome } : undefined}
          submitLabel={editing ? "Salvar" : "Adicionar"}
          onSubmit={handleSubmit}
        />
      </Modal>
    </div>
  );
}
