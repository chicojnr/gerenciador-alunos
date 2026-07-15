import { useRef, useState, DragEvent } from "react";
import { UploadCloud } from "lucide-react";
import { Modal } from "../../../shared/components/Modal.js";
import { Button } from "../../../shared/components/Button.js";
import { materiasService } from "../services/materias.service.js";
import type { MateriaImportConfirmResult } from "../types.js";

interface MateriaImportModalProps {
  open: boolean;
  onClose: () => void;
  onImported: () => void;
}

interface PreviewRow {
  nome: string;
  codigo: string;
  status: "novo" | "existente";
  selected: boolean;
}

type Step = "upload" | "parsing" | "preview" | "confirming" | "result";

export function MateriaImportModal({ open, onClose, onImported }: MateriaImportModalProps) {
  const [step, setStep] = useState<Step>("upload");
  const [dragging, setDragging] = useState(false);
  const [rows, setRows] = useState<PreviewRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<MateriaImportConfirmResult | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function reset() {
    setStep("upload");
    setRows([]);
    setError(null);
    setResult(null);
    setDragging(false);
  }

  function handleClose() {
    reset();
    onClose();
  }

  async function handleFile(file: File) {
    setError(null);
    setStep("parsing");
    try {
      const { items } = await materiasService.importParse(file);
      setRows(
        items.map((item) => ({
          ...item,
          selected: item.status === "novo"
        }))
      );
      setStep("preview");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível ler o PDF.");
      setStep("upload");
    }
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFile(file);
    }
  }

  function updateRow(index: number, patch: Partial<PreviewRow>) {
    setRows((prev) => prev.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  }

  async function handleConfirm() {
    const selected = rows.filter((r) => r.selected);
    if (selected.some((r) => r.nome.trim() === "" || r.codigo.trim() === "")) {
      setError("nome e código são obrigatórios nos itens selecionados");
      return;
    }
    setError(null);
    setStep("confirming");
    try {
      const res = await materiasService.importConfirm(
        selected.map((r) => ({ nome: r.nome, codigo: r.codigo }))
      );
      setResult(res);
      setStep("result");
      onImported();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível importar as disciplinas.");
      setStep("preview");
    }
  }

  return (
    <Modal open={open} onClose={handleClose} size="lg">
      <h2 className="mb-4 text-sm font-semibold text-zinc-900">Importar disciplinas de PDF</h2>

      {step === "upload" && (
        <div>
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-10 text-center transition-colors ${
              dragging ? "border-indigo-500 bg-indigo-50" : "border-zinc-300"
            }`}
          >
            <UploadCloud className="h-8 w-8 text-zinc-400" strokeWidth={1.5} />
            <p className="text-sm text-zinc-600">Arraste um PDF ou clique para selecionar</p>
            <input
              ref={inputRef}
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  handleFile(file);
                }
              }}
            />
          </div>
          {error && (
            <p role="alert" className="mt-3 text-sm text-red-600">
              {error}
            </p>
          )}
          <div className="mt-4 flex justify-end">
            <Button variant="secondary" onClick={handleClose}>
              Cancelar
            </Button>
          </div>
        </div>
      )}

      {step === "parsing" && <p className="text-sm text-zinc-500">Lendo PDF...</p>}

      {step === "preview" && (
        <div>
          <p className="mb-3 text-sm text-zinc-500">
            Confira e corrija os dados antes de confirmar a importação.
          </p>
          <div className="max-h-96 overflow-y-auto rounded-lg border border-zinc-200">
            <table className="w-full text-sm">
              <thead className="bg-zinc-50">
                <tr>
                  <th className="px-3 py-2 text-left font-medium text-zinc-600"></th>
                  <th className="px-3 py-2 text-left font-medium text-zinc-600">Nome</th>
                  <th className="px-3 py-2 text-left font-medium text-zinc-600">Código</th>
                  <th className="px-3 py-2 text-left font-medium text-zinc-600">Status</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={i} className="border-t border-zinc-100">
                    <td className="px-3 py-2">
                      <input
                        type="checkbox"
                        checked={row.selected}
                        onChange={(e) => updateRow(i, { selected: e.target.checked })}
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        value={row.nome}
                        onChange={(e) => updateRow(i, { nome: e.target.value })}
                        className="w-full rounded-md border border-zinc-300 px-2 py-1 text-sm focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        value={row.codigo}
                        onChange={(e) => updateRow(i, { codigo: e.target.value })}
                        className="w-32 rounded-md border border-zinc-300 px-2 py-1 text-sm focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          row.status === "novo"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-zinc-100 text-zinc-500"
                        }`}
                      >
                        {row.status === "novo" ? "novo" : "já cadastrada"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {error && (
            <p role="alert" className="mt-3 text-sm text-red-600">
              {error}
            </p>
          )}
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="secondary" onClick={handleClose}>
              Cancelar
            </Button>
            <Button onClick={handleConfirm}>Confirmar importação</Button>
          </div>
        </div>
      )}

      {step === "confirming" && <p className="text-sm text-zinc-500">Importando...</p>}

      {step === "result" && result && (
        <div>
          <p className="text-sm text-zinc-700">
            {result.created.length} disciplina(s) importada(s) com sucesso.
          </p>
          {result.errors.length > 0 && (
            <ul className="mt-2 space-y-1 text-sm text-red-600">
              {result.errors.map((e, i) => (
                <li key={i}>
                  {e.codigo}: {e.message}
                </li>
              ))}
            </ul>
          )}
          <div className="mt-4 flex justify-end">
            <Button onClick={handleClose}>Fechar</Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
