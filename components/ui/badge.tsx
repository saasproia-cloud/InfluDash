import * as React from "react";
import { cn } from "@/lib/utils";

type BadgeVariant = "default" | "accent" | "success" | "warning" | "danger" | "outline";

export function Badge({
  className,
  variant = "default",
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { variant?: BadgeVariant }) {
  const styles: Record<BadgeVariant, string> = {
    default: "bg-[var(--muted)] text-[var(--foreground)]",
    accent: "bg-[var(--accent)]/15 text-[var(--accent)] border border-[var(--accent)]/30",
    success: "bg-emerald-500/15 text-emerald-500 border border-emerald-500/30",
    warning: "bg-amber-500/15 text-amber-500 border border-amber-500/30",
    danger: "bg-red-500/15 text-red-500 border border-red-500/30",
    outline: "border border-[var(--border)] text-[var(--muted-foreground)]",
  };
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide",
        styles[variant],
        className
      )}
      {...props}
    />
  );
}
