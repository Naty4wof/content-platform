import type { HTMLAttributes } from "react";

import { cn } from "./cn";

type BadgeVariant = "default" | "subtle" | "success" | "warning";

const variantClasses: Record<BadgeVariant, string> = {
  default:
    "border-slate-900 bg-slate-950 text-white shadow-sm",
  subtle:
    "border-slate-200 bg-slate-100 text-slate-700",
  success: "border-emerald-200 bg-emerald-50 text-emerald-700",
  warning: "border-amber-200 bg-amber-50 text-amber-700",
};

export function Badge({
  className,
  variant = "default",
  ...props
}: HTMLAttributes<HTMLSpanElement> & { variant?: BadgeVariant }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium tracking-[0.01em]",
        variantClasses[variant],
        className,
      )}
      {...props}
    />
  );
}
