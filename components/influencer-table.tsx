"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { MoreVertical, Pencil, Trash2, ArrowUpDown, Clock } from "lucide-react";
import type { Influencer } from "@/lib/types";
import {
  coutInflu,
  marge,
  panierMoyen,
  roi,
} from "@/lib/calc";
import { fmtEur, fmtPct, cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown";
import { useStore } from "@/lib/store";
import { InfluencerForm } from "./influencer-form";

type SortKey = "name" | "revenu" | "coutInflu" | "marge" | "roi";

const PLATFORM_LABEL: Record<string, string> = {
  tiktok: "TikTok",
  instagram: "Instagram",
  youtube: "YouTube",
  snapchat: "Snapchat",
  x: "X",
  other: "Autre",
};

export function InfluencerTable({
  appId,
  influencers,
}: {
  appId: string;
  influencers: Influencer[];
}) {
  const [sort, setSort] = useState<SortKey>("revenu");
  const [dir, setDir] = useState<"asc" | "desc">("desc");
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<Influencer | null>(null);
  const deleteInfluencer = useStore((s) => s.deleteInfluencer);

  const rows = useMemo(() => {
    const filtered = influencers.filter((i) =>
      query
        ? `${i.name} ${i.handle ?? ""}`.toLowerCase().includes(query.toLowerCase())
        : true
    );
    const sortVal = (i: Influencer): number | string => {
      switch (sort) {
        case "name":
          return i.name.toLowerCase();
        case "revenu":
          return i.revenu ?? -Infinity;
        case "coutInflu":
          return coutInflu(i) ?? -Infinity;
        case "marge":
          return marge(i) ?? -Infinity;
        case "roi":
          return roi(i) ?? -Infinity;
      }
    };
    return [...filtered].sort((a, b) => {
      const va = sortVal(a);
      const vb = sortVal(b);
      if (va < vb) return dir === "asc" ? -1 : 1;
      if (va > vb) return dir === "asc" ? 1 : -1;
      return 0;
    });
  }, [influencers, sort, dir, query]);

  function toggleSort(k: SortKey) {
    if (sort === k) setDir(dir === "asc" ? "desc" : "asc");
    else {
      setSort(k);
      setDir(k === "name" ? "asc" : "desc");
    }
  }

  return (
    <>
      <div className="mb-3 flex items-center gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher un influenceur…"
          className="h-10 w-full rounded-md border border-[var(--input)] bg-[var(--background)] px-3 text-sm placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-[var(--accent)] sm:h-9 sm:w-64"
        />
        <span className="shrink-0 text-xs text-[var(--muted-foreground)]">
          {rows.length}/{influencers.length}
        </span>
      </div>

      {/* Mobile: card list */}
      <div className="flex flex-col gap-2 md:hidden">
        {rows.map((i) => {
          const c = coutInflu(i);
          const m = marge(i);
          const r = roi(i);
          return (
            <div
              key={i.id}
              className={cn(
                "rounded-xl border border-[var(--border)] bg-[var(--card)] p-4",
                i.launched === false && "border-amber-500/30 bg-amber-500/5"
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <Link
                  href={`/apps/${appId}/influencers/${i.id}`}
                  className="min-w-0 flex-1"
                >
                  <div className="truncate font-medium">{i.name}</div>
                  <div className="mt-0.5 flex items-center gap-2 text-xs text-[var(--muted-foreground)]">
                    {i.handle && <span className="truncate">{i.handle}</span>}
                    <span>· {PLATFORM_LABEL[i.platform ?? "other"]}</span>
                  </div>
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      className="-mr-1 -mt-1 rounded-md p-2 text-[var(--muted-foreground)] hover:bg-[var(--muted)]"
                      aria-label="Actions"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onSelect={() => setEditing(i)}>
                      <Pencil className="h-3.5 w-3.5" />
                      Modifier
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      destructive
                      onSelect={() => {
                        if (confirm(`Supprimer ${i.name} ?`)) deleteInfluencer(i.id);
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Supprimer
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {i.launched === false && (
                  <Badge variant="warning">
                    <Clock className="h-3 w-3" /> Pas encore lancé
                  </Badge>
                )}
                {i.paymentType === "rpm" ? (
                  <Badge variant="accent">RPM {i.rpmGiven ? `· ${i.rpmGiven}€` : ""}</Badge>
                ) : (
                  <Badge variant="outline">Fixe</Badge>
                )}
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 text-sm">
                <MobileStat label="Revenu" value={fmtEur(i.revenu)} />
                <MobileStat label="Coût" value={fmtEur(c)} />
                <MobileStat
                  label="Marge"
                  value={fmtEur(m)}
                  tint={m === null ? undefined : m >= 0 ? "pos" : "neg"}
                />
                <MobileStat label="Panier" value={fmtEur(panierMoyen(i))} />
                <MobileStat
                  label="ROI"
                  value={fmtPct(r)}
                  tint={r === null ? undefined : r >= 0 ? "pos" : "neg"}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop: table */}
      <div className="hidden overflow-x-auto rounded-xl border border-[var(--border)] md:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] bg-[var(--subtle)] text-left text-[10px] font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
              <Th onClick={() => toggleSort("name")} active={sort === "name"} dir={dir}>
                Influenceur
              </Th>
              <th className="px-4 py-3">Plateforme</th>
              <th className="px-4 py-3">Paiement</th>
              <Th
                onClick={() => toggleSort("revenu")}
                active={sort === "revenu"}
                dir={dir}
                align="right"
              >
                Revenu
              </Th>
              <Th
                onClick={() => toggleSort("coutInflu")}
                active={sort === "coutInflu"}
                dir={dir}
                align="right"
              >
                Coût
              </Th>
              <th className="px-4 py-3 text-right">Panier moy.</th>
              <Th
                onClick={() => toggleSort("marge")}
                active={sort === "marge"}
                dir={dir}
                align="right"
              >
                Marge
              </Th>
              <Th
                onClick={() => toggleSort("roi")}
                active={sort === "roi"}
                dir={dir}
                align="right"
              >
                ROI
              </Th>
              <th className="px-2 py-3" />
            </tr>
          </thead>
          <tbody>
            {rows.map((i) => {
              const c = coutInflu(i);
              const m = marge(i);
              const r = roi(i);
              return (
                <tr
                  key={i.id}
                  className={cn(
                    "border-b border-[var(--border)] transition-colors hover:bg-[var(--subtle)]",
                    i.launched === false && "bg-amber-500/5"
                  )}
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/apps/${appId}/influencers/${i.id}`}
                      className="block font-medium hover:text-[var(--accent)]"
                    >
                      {i.name}
                      {i.handle && (
                        <div className="text-xs text-[var(--muted-foreground)]">{i.handle}</div>
                      )}
                    </Link>
                    {i.launched === false && (
                      <Badge variant="warning" className="mt-1">
                        <Clock className="h-3 w-3" /> Pas encore lancé
                      </Badge>
                    )}
                  </td>
                  <td className="px-4 py-3 text-[var(--muted-foreground)]">
                    {PLATFORM_LABEL[i.platform ?? "other"]}
                  </td>
                  <td className="px-4 py-3">
                    {i.paymentType === "rpm" ? (
                      <Badge variant="accent">RPM {i.rpmGiven ? `· ${i.rpmGiven}€` : ""}</Badge>
                    ) : (
                      <Badge variant="outline">Fixe</Badge>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">{fmtEur(i.revenu)}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{fmtEur(c)}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{fmtEur(panierMoyen(i))}</td>
                  <td
                    className={cn(
                      "px-4 py-3 text-right tabular-nums font-medium",
                      m === null ? "" : m >= 0 ? "text-emerald-500" : "text-red-500"
                    )}
                  >
                    {fmtEur(m)}
                  </td>
                  <td
                    className={cn(
                      "px-4 py-3 text-right tabular-nums font-medium",
                      r === null ? "" : r >= 0 ? "text-emerald-500" : "text-red-500"
                    )}
                  >
                    {fmtPct(r)}
                  </td>
                  <td className="px-2 py-3">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          className="rounded-md p-1.5 text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]"
                          aria-label="Actions"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onSelect={() => setEditing(i)}>
                          <Pencil className="h-3.5 w-3.5" />
                          Modifier
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          destructive
                          onSelect={() => {
                            if (confirm(`Supprimer ${i.name} ?`)) deleteInfluencer(i.id);
                          }}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Supprimer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {editing && (
        <InfluencerForm
          appId={appId}
          initial={editing}
          open={!!editing}
          onOpenChange={(v) => !v && setEditing(null)}
        />
      )}

      {rows.length === 0 && query && (
        <div className="py-10 text-center text-sm text-[var(--muted-foreground)]">
          Aucun résultat pour « {query} »
        </div>
      )}

      <div className="mt-2 hidden items-center justify-end gap-1 text-[10px] text-[var(--muted-foreground)] md:flex">
        <kbd className="rounded border border-[var(--border)] px-1 py-0.5">Cliquer un nom</kbd>{" "}
        pour voir le détail
      </div>
    </>
  );
}

function MobileStat({
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
        className={cn(
          "mt-0.5 font-medium tabular-nums",
          tint === "pos" ? "text-emerald-500" : tint === "neg" ? "text-red-500" : ""
        )}
      >
        {value}
      </div>
    </div>
  );
}

function Th({
  children,
  onClick,
  active,
  align = "left",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  active?: boolean;
  dir?: "asc" | "desc";
  align?: "left" | "right";
}) {
  return (
    <th
      onClick={onClick}
      className={cn(
        "px-4 py-3",
        align === "right" && "text-right",
        onClick && "cursor-pointer hover:text-[var(--foreground)]",
        active && "text-[var(--foreground)]"
      )}
    >
      <span className={cn("inline-flex items-center gap-1", align === "right" && "justify-end")}>
        {children}
        {onClick && active && <ArrowUpDown className="h-3 w-3 opacity-70" />}
      </span>
    </th>
  );
}
