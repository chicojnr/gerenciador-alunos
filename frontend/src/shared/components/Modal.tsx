import { ReactNode } from "react";

type ModalSize = "md" | "lg";

const SIZE_CLASSES: Record<ModalSize, string> = {
  md: "max-w-md",
  lg: "max-w-3xl"
};

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  size?: ModalSize;
}

export function Modal({ open, onClose, children, size = "md" }: ModalProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex animate-overlay-in items-center justify-center bg-black/40 p-4">
      <div
        role="dialog"
        aria-modal="true"
        className={`w-full ${SIZE_CLASSES[size]} animate-modal-in rounded-lg bg-white p-6 shadow-xl`}
      >
        {children}
      </div>
    </div>
  );
}
