import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "./cn";

interface EmptyStateProps extends HTMLAttributes<HTMLDivElement> {
  title: string;
  description: string;
  action?: ReactNode;
}

export function EmptyState({
  title,
  description,
  action,
  className,
  ...props
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-dashed border-slate-300 bg-slate-50/80 p-6 text-center",
        className,
      )}
      {...props}
    >
      <p className="text-sm font-semibold text-slate-900">{title}</p>
      <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
      {action ? (
        <div className="mt-4 flex items-center justify-center">{action}</div>
      ) : null}
    </div>
  );
}
