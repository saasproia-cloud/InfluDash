"use client";

import { ArrowDownRight, ArrowUpRight, type LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type Metric = {
  label: string;
  value: string;
  hint?: string;
  icon?: LucideIcon;
  trend?: "up" | "down" | "neutral";
  accent?: boolean;
};

export function MetricsGrid({
  metrics,
  cols = 4,
}: {
  metrics: Metric[];
  cols?: 2 | 3 | 4 | 5 | 6;
}) {
  const gridCls: Record<number, string> = {
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-2 lg:grid-cols-4",
    5: "grid-cols-2 lg:grid-cols-5",
    6: "grid-cols-2 lg:grid-cols-3 xl:grid-cols-6",
  };
  return (
    <div className={cn("grid gap-3", gridCls[cols])}>
      {metrics.map((m) => (
        <MetricCard key={m.label} metric={m} />
      ))}
    </div>
  );
}

function MetricCard({ metric }: { metric: Metric }) {
  const Icon = metric.icon;
  return (
    <Card
      className={cn(
        "relative overflow-hidden p-4",
        metric.accent && "border-[var(--accent)]/40 glow"
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
          {metric.label}
        </span>
        {Icon && (
          <Icon
            className={cn(
              "h-3.5 w-3.5",
              metric.accent ? "text-[var(--accent)]" : "text-[var(--muted-foreground)]"
            )}
          />
        )}
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <span
          className={cn(
            "text-2xl font-semibold tracking-tight tabular-nums",
            metric.accent && "text-[var(--accent)]"
          )}
        >
          {metric.value}
        </span>
        {metric.trend && metric.trend !== "neutral" && (
          <span
            className={cn(
              "flex items-center text-xs",
              metric.trend === "up" ? "text-emerald-500" : "text-red-500"
            )}
          >
            {metric.trend === "up" ? (
              <ArrowUpRight className="h-3 w-3" />
            ) : (
              <ArrowDownRight className="h-3 w-3" />
            )}
          </span>
        )}
      </div>
      {metric.hint && (
        <div className="mt-1 text-xs text-[var(--muted-foreground)]">{metric.hint}</div>
      )}
    </Card>
  );
}
