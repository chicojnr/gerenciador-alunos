import { ReactNode } from "react";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}

export function Modal({ open, onClose, children }: ModalProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div role="dialog" aria-modal="true" className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <div className="mb-2 flex justify-end">
          <button
            aria-label="Fechar"
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-600"
          >
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
