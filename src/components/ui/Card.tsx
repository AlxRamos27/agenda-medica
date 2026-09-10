import type { ElementType, ReactNode } from "react";
import { cn } from "@/lib/cn";

const paddings = {
  sm: "p-4",
  md: "p-5",
  lg: "p-8",
} as const;

export function Card({
  className,
  children,
  padding = "md",
  as,
  title,
  description,
  actions,
}: {
  className?: string;
  children: ReactNode;
  padding?: keyof typeof paddings;
  as?: ElementType;
  title?: string;
  description?: string;
  actions?: ReactNode;
}) {
  const Comp = as ?? "div";
  return (
    <Comp className={cn("rounded-md border border-border bg-surface shadow-sm", paddings[padding], className)}>
      {(title || actions) && (
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            {title && <h2 className="text-base font-semibold text-foreground">{title}</h2>}
            {description && <p className="mt-0.5 text-sm text-muted">{description}</p>}
          </div>
          {actions && <div className="flex shrink-0 gap-2">{actions}</div>}
        </div>
      )}
      {children}
    </Comp>
  );
}
