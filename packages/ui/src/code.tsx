import type { HTMLAttributes } from "react";

import { cn } from "./cn";

export function Code({
  children,
  className,
  ...props
}: HTMLAttributes<HTMLElement>) {
  return (
    <code
      className={cn(
        "rounded-lg border border-slate-200/80 bg-slate-100/90 px-1.5 py-0.5 font-mono text-[0.85em] text-slate-950 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)]",
        className,
      )}
      {...props}
    >
      {children}
    </code>
  );
}
