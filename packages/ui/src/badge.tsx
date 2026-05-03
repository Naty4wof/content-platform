import type { HTMLAttributes } from "react";

import { cn } from "./cn";

type BadgeVariant = "default" | "subtle" | "success" | "warning";

const variantClasses: Record<BadgeVariant, string> = {
  default:
    "border-slate-900/90 bg-slate-950 text-white shadow-[0_6px_16px_rgba(15,23,42,0.15)]",
  subtle: "border-slate-200/80 bg-slate-100/90 text-slate-700",
  success: "border-emerald-200/80 bg-emerald-50/90 text-emerald-700",
  warning: "border-amber-200/80 bg-amber-50/90 text-amber-700",
};

export function Badge({
  className,
  variant = "default",
  ...props
}: HTMLAttributes<HTMLSpanElement> & { variant?: BadgeVariant }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.12em]",
        variantClasses[variant],
        className,
      )}
      {...props}
    />
  );
}
