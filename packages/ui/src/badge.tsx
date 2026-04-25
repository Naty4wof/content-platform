import type { HTMLAttributes } from "react";

import { cn } from "./cn";

type BadgeVariant = "default" | "subtle" | "success" | "warning";

const variantClasses: Record<BadgeVariant, string> = {
  default: "bg-slate-950 text-white",
  subtle: "bg-slate-100 text-slate-700",
  success: "bg-emerald-100 text-emerald-700",
  warning: "bg-amber-100 text-amber-800",
};

export function Badge({
  className,
  variant = "default",
  ...props
}: HTMLAttributes<HTMLSpanElement> & { variant?: BadgeVariant }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
        variantClasses[variant],
        className,
      )}
      {...props}
    />
  );
}
