interface ClickableCellProps {
  text: string;
  onClick: () => void;
}

export function ClickableCell({ text, onClick }: ClickableCellProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-left hover:text-indigo-600 hover:underline"
    >
      {text}
    </button>
  );
}
