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
        "rounded-md border border-slate-200 bg-slate-100 px-1.5 py-0.5 font-mono text-[0.85em] text-slate-950",
        className,
      )}
      {...props}
    >
      {children}
    </code>
  );
}
