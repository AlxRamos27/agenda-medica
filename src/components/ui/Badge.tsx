import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type Variant = "success" | "warning" | "danger" | "info" | "neutral";

const variantClasses: Record<Variant, string> = {
  success: "bg-success-bg text-success-text border-success-border",
  warning: "bg-warning-bg text-warning-text border-warning-border",
  danger: "bg-danger-bg text-danger-text border-danger-border",
  info: "bg-info-bg text-info-text border-info-border",
  neutral: "bg-neutral-bg text-neutral-text border-neutral-border",
};

export function Badge({
  variant = "neutral",
  icon: Icon,
  children,
  className,
}: {
  variant?: Variant;
  icon?: LucideIcon;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
        variantClasses[variant],
        className
      )}
    >
      {Icon && <Icon className="h-3 w-3" aria-hidden />}
      {children}
    </span>
  );
}
