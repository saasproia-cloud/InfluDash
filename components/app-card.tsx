"use client";

import Link from "next/link";
import { ArrowRight, Users, Eye } from "lucide-react";
import type { App, Influencer } from "@/lib/types";
import { aggregate } from "@/lib/calc";
import { fmtEur, fmtNum, fmtPct } from "@/lib/utils";
import { Card } from "@/components/ui/card";

export function AppCard({ app, influencers }: { app: App; influencers: Influencer[] }) {
  const m = aggregate(influencers);
  const accent = app.accentColor;

  return (
    <Link href={`/apps/${app.id}`} className="group block">
      <Card className="relative overflow-hidden p-5 transition-all hover:border-[var(--accent)]/40 hover:shadow-lg">
        <div
          className="absolute inset-x-0 top-0 h-1"
          style={{ background: accent || "var(--accent)" }}
        />
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-[var(--muted)] text-xl">
              {app.emoji || "📦"}
            </div>
            <div>
              <div className="font-semibold tracking-tight">{app.name}</div>
              <div className="text-xs text-[var(--muted-foreground)]">
                {m.count} influenceur{m.count > 1 ? "s" : ""}
              </div>
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-[var(--muted-foreground)] transition-transform group-hover:translate-x-0.5 group-hover:text-[var(--accent)]" />
        </div>

        <div className="mt-5 grid grid-cols-3 gap-3">
          <Stat label="Revenu" value={fmtEur(m.revenu)} />
          <Stat label="Coût" value={fmtEur(m.coutInflu)} />
          <Stat
            label="ROI"
            value={fmtPct(m.roi)}
            tint={m.roi !== null ? (m.roi >= 0 ? "pos" : "neg") : undefined}
          />
        </div>

        <div className="mt-4 flex items-center gap-4 text-xs text-[var(--muted-foreground)]">
          <span className="flex items-center gap-1">
            <Users className="h-3 w-3" /> {fmtNum(m.users)}
          </span>
          <span className="flex items-center gap-1">
            <Eye className="h-3 w-3" /> {fmtNum(m.vues)}
          </span>
        </div>
      </Card>
    </Link>
  );
}

function Stat({
  label,
  value,
  tint,
}: {
  label: string;
  value: string;
  tint?: "pos" | "neg";
}) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wide text-[var(--muted-foreground)]">
        {label}
      </div>
      <div
        className={
          "mt-0.5 text-sm font-semibold tabular-nums " +
          (tint === "pos" ? "text-emerald-500" : tint === "neg" ? "text-red-500" : "")
        }
      >
        {value}
      </div>
    </div>
  );
}
