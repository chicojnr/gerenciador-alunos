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
    <div role="dialog" aria-modal="true">
      <button aria-label="Fechar" onClick={onClose}>
        ×
      </button>
      {children}
    </div>
  );
}
