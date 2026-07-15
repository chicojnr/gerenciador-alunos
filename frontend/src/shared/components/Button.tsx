import { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "danger";
type Size = "md" | "sm";

const VARIANT_CLASSES: Record<Variant, string> = {
  primary:
    "bg-indigo-600 text-white shadow-[0_1px_2px_rgba(14,26,32,0.18),0_1px_1px_rgba(14,26,32,0.10)] hover:bg-indigo-700 focus-visible:outline-indigo-600",
  secondary:
    "bg-white text-zinc-700 border border-zinc-300 hover:bg-zinc-50 focus-visible:outline-zinc-400",
  danger:
    "bg-white text-red-600 border border-red-300 hover:bg-red-50 focus-visible:outline-red-500"
};

const SIZE_CLASSES: Record<Size, string> = {
  md: "px-3 py-1.5 text-sm",
  sm: "px-2 py-1 text-xs"
};

const BASE_CLASSES =
  "inline-flex items-center justify-center rounded-md font-medium transition-[background-color,border-color,color,transform,box-shadow] duration-150 ease-out active:scale-[0.97] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export function Button({ variant = "primary", size = "md", className, ...props }: ButtonProps) {
  const classes = [BASE_CLASSES, SIZE_CLASSES[size], VARIANT_CLASSES[variant], className]
    .filter(Boolean)
    .join(" ");
  return <button className={classes} {...props} />;
}
