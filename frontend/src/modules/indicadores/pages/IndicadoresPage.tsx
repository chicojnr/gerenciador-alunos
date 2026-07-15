import { useState } from "react";
import { Bell, Plus } from "lucide-react";
import { useIndicadores } from "../hooks/useIndicadores.js";
import { useEscolaOptions } from "../../../shared/hooks/useEscolaOptions.js";
import { IndicadorForm } from "../components/IndicadorForm.js";
import { IndicadorList } from "../components/IndicadorList.js";
import { Modal } from "../../../shared/components/Modal.js";
import { Button } from "../../../shared/components/Button.js";
import { useConfirm } from "../../../shared/contexts/ConfirmContext.js";
import type { Indicador, CreateIndicadorInput } from "../types.js";

const SELECT_CLASSES =
  "rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600";

export function IndicadoresPage() {
  const { escolas, loading: loadingEscolas } = useEscolaOptions();
  const [escolaId, setEscolaId] = useState("");
  const { indicadores, loading, error, create, update, remove } = useIndicadores(
    escolaId || undefined
  );
  const confirm = useConfirm();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Indicador | null>(null);

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
      const ok = await confirm({
        title: "Salvar alterações",
        message: "Confirma a alteração deste indicador?",
        confirmLabel: "Salvar"
      });
      if (!ok) {
        return;
      }
      await update(editing.id, data);
    } else {
      await create(data);
    }
    setModalOpen(false);
  }

  async function handleRemove(id: string) {
    const ok = await confirm({
      title: "Remover indicador",
      message: "Tem certeza que deseja remover este indicador?",
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
          <Bell className="h-5 w-5 text-zinc-400" strokeWidth={2} />
          <h1 className="text-xl font-semibold text-zinc-900">Indicadores de Falta</h1>
        </div>
        <Button onClick={openCreate} disabled={!escolaId}>
          <Plus className="mr-1.5 h-4 w-4" strokeWidth={2.25} />
          Novo Indicador
        </Button>
      </div>

      <div className="mb-6">
        <select
          value={escolaId}
          onChange={(e) => setEscolaId(e.target.value)}
          disabled={loadingEscolas}
          className={SELECT_CLASSES}
        >
          <option value="">Todas as escolas</option>
          {escolas.map((e) => (
            <option key={e.id} value={e.id}>
              {e.nome}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <p role="alert" className="mb-4 text-sm text-red-600">
          {error}
        </p>
      )}

      {loading ? (
        <p className="text-zinc-500">Carregando...</p>
      ) : (
        <IndicadorList indicadores={indicadores} onEdit={openEdit} onRemove={handleRemove} />
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        {(editing?.escolaId ?? escolaId) && (
          <IndicadorForm
            escolaId={editing?.escolaId ?? escolaId}
            initial={
              editing
                ? {
                    nome: editing.nome,
                    tipo: editing.tipo,
                    quantidade: editing.quantidade,
                    janelaDias: editing.janelaDias ?? undefined,
                    escolaId: editing.escolaId
                  }
                : undefined
            }
            submitLabel={editing ? "Salvar" : "Adicionar"}
            onSubmit={handleSubmit}
            onCancel={() => setModalOpen(false)}
          />
        )}
      </Modal>
    </div>
  );
}
