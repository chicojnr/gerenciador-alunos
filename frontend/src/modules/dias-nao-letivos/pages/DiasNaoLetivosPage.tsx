import { useState } from "react";
import { CalendarOff, Plus } from "lucide-react";
import { useDiasNaoLetivos } from "../hooks/useDiasNaoLetivos.js";
import { useEscolaOptions } from "../../../shared/hooks/useEscolaOptions.js";
import { DiaNaoLetivoForm } from "../components/DiaNaoLetivoForm.js";
import { DiaNaoLetivoList } from "../components/DiaNaoLetivoList.js";
import { Modal } from "../../../shared/components/Modal.js";
import { Button } from "../../../shared/components/Button.js";
import { useConfirm } from "../../../shared/contexts/ConfirmContext.js";
import type { CreateDiaNaoLetivoInput } from "../types.js";

const SELECT_CLASSES =
  "rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600";

export function DiasNaoLetivosPage() {
  const { escolas, loading: loadingEscolas } = useEscolaOptions();
  const [escolaId, setEscolaId] = useState("");
  const { dias, loading, error, create, remove } = useDiasNaoLetivos(escolaId);
  const confirm = useConfirm();
  const [modalOpen, setModalOpen] = useState(false);

  async function handleSubmit(data: CreateDiaNaoLetivoInput) {
    await create(data);
    setModalOpen(false);
  }

  async function handleRemove(id: string) {
    const ok = await confirm({
      title: "Remover dia não letivo",
      message: "Tem certeza que deseja remover este dia não letivo?",
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
          <CalendarOff className="h-5 w-5 text-zinc-400" strokeWidth={2} />
          <h1 className="text-xl font-semibold text-zinc-900">Dias Não Letivos</h1>
        </div>
        <Button onClick={() => setModalOpen(true)} disabled={!escolaId}>
          <Plus className="mr-1.5 h-4 w-4" strokeWidth={2.25} />
          Novo Dia Não Letivo
        </Button>
      </div>

      <div className="mb-6">
        <select
          value={escolaId}
          onChange={(e) => setEscolaId(e.target.value)}
          disabled={loadingEscolas}
          className={SELECT_CLASSES}
        >
          <option value="">Selecione uma escola</option>
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

      {!escolaId ? (
        <p className="text-sm text-zinc-400">
          Selecione uma escola para ver feriados, pontes e férias cadastrados.
        </p>
      ) : loading ? (
        <p className="text-zinc-500">Carregando...</p>
      ) : (
        <DiaNaoLetivoList dias={dias} onRemove={handleRemove} />
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <DiaNaoLetivoForm onSubmit={handleSubmit} onCancel={() => setModalOpen(false)} />
      </Modal>
    </div>
  );
}
