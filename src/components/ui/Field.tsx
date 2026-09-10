import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function Field({
  label,
  htmlFor,
  required,
  error,
  children,
  className,
}: {
  label: string;
  htmlFor: string;
  required?: boolean;
  error?: string | null;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1", className)}>
      <label htmlFor={htmlFor} className="block text-sm font-medium text-foreground">
        {label}
        {required && (
          <span className="ml-0.5 text-danger-text" aria-hidden>
            *
          </span>
        )}
      </label>
      {children}
      {error && (
        <p className="text-sm text-danger-text" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
