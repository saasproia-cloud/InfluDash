"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Users,
  Eye,
  Wallet,
  PiggyBank,
  TrendingUp,
  UserPlus,
  Settings as SettingsIcon,
  Trash2,
} from "lucide-react";
import { useAppById, useInfluencersByApp, useStore } from "@/lib/store";
import { aggregate } from "@/lib/calc";
import { fmtEur, fmtNum, fmtPct } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { MetricsGrid } from "@/components/metrics-grid";
import { InfluencerTable } from "@/components/influencer-table";
import { InfluencerForm } from "@/components/influencer-form";
import { EmptyState } from "@/components/empty-state";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PRESETS } from "@/lib/presets";

export default function AppPage({ params }: { params: Promise<{ appId: string }> }) {
  const { appId } = use(params);
  const router = useRouter();
  const app = useAppById(appId);
  const influencers = useInfluencersByApp(appId);
  const deleteApp = useStore((s) => s.deleteApp);
  const [newOpen, setNewOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  if (!app) {
    return (
      <div className="mx-auto max-w-7xl p-8">
        <EmptyState
          title="Application introuvable"
          description="Cette app n'existe pas ou a été supprimée."
        />
      </div>
    );
  }

  const m = aggregate(influencers);

  return (
    <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
      <div className="mb-6 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
        <div className="flex items-center gap-3 sm:gap-4">
          <div
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl sm:h-14 sm:w-14"
            style={{
              background: app.accentColor
                ? `${app.accentColor}20`
                : "color-mix(in oklab, var(--accent) 14%, transparent)",
            }}
          >
            {app.emoji || "📦"}
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-2xl font-semibold tracking-tight sm:text-3xl">
              {app.name}
            </h1>
            <p className="mt-0.5 text-sm text-[var(--muted-foreground)]">
              {influencers.length} influenceur{influencers.length > 1 ? "s" : ""}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => setNewOpen(true)} className="flex-1 sm:flex-none">
            <Plus className="h-4 w-4" />
            Nouvel influenceur
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" aria-label="Options de l'app">
                <SettingsIcon className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => setEditOpen(true)}>
                <SettingsIcon className="h-3.5 w-3.5" />
                Modifier l'app
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                destructive
                onSelect={() => {
                  if (
                    confirm(
                      `Supprimer "${app.name}" et ses ${influencers.length} influenceur(s) ?`
                    )
                  ) {
                    deleteApp(app.id);
                    router.push("/");
                  }
                }}
              >
                <Trash2 className="h-3.5 w-3.5" />
                Supprimer l'app
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <MetricsGrid
        cols={6}
        metrics={[
          { label: "Revenu", value: fmtEur(m.revenu), icon: Wallet, accent: true },
          { label: "Coût influ", value: fmtEur(m.coutInflu), icon: PiggyBank },
          {
            label: "Marge",
            value: fmtEur(m.marge),
            icon: TrendingUp,
            trend: m.marge >= 0 ? "up" : "down",
          },
          { label: "ROI", value: fmtPct(m.roi), icon: TrendingUp },
          { label: "Users", value: fmtNum(m.users), icon: Users },
          { label: "Vues", value: fmtNum(m.vues), icon: Eye },
        ]}
      />

      <div className="mt-10 mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold tracking-tight">Influenceurs</h2>
        <span className="text-xs text-[var(--muted-foreground)]">
          {m.nbClients > 0 && <>Clients : {fmtNum(m.nbClients)}</>}
        </span>
      </div>

      {influencers.length === 0 ? (
        <EmptyState
          icon={UserPlus}
          title="Aucun influenceur"
          description="Ajoutez le premier influenceur de cette app pour commencer à tracker ses performances."
          action={
            <Button onClick={() => setNewOpen(true)}>
              <Plus className="h-4 w-4" />
              Ajouter un influenceur
            </Button>
          }
        />
      ) : (
        <InfluencerTable appId={app.id} influencers={influencers} />
      )}

      <InfluencerForm appId={app.id} open={newOpen} onOpenChange={setNewOpen} />
      <EditAppDialog appId={app.id} open={editOpen} onOpenChange={setEditOpen} />
    </div>
  );
}

function EditAppDialog({
  appId,
  open,
  onOpenChange,
}: {
  appId: string;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const app = useAppById(appId);
  const updateApp = useStore((s) => s.updateApp);
  const [name, setName] = useState(app?.name ?? "");
  const [emoji, setEmoji] = useState(app?.emoji ?? "📦");
  const [accent, setAccent] = useState(app?.accentColor ?? "");

  if (!app) return null;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    updateApp(appId, {
      name: name.trim() || app!.name,
      emoji: emoji || undefined,
      accentColor: accent || undefined,
    });
    onOpenChange(false);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v);
        if (v) {
          setName(app!.name);
          setEmoji(app!.emoji ?? "📦");
          setAccent(app!.accentColor ?? "");
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Modifier l'application</DialogTitle>
          <DialogDescription>Nom, emoji, et couleur d'accent propre à cette app.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="grid gap-4">
          <div className="grid grid-cols-[80px_1fr] gap-3">
            <div className="grid gap-1.5">
              <Label>Emoji</Label>
              <Input
                value={emoji}
                onChange={(e) => setEmoji(e.target.value)}
                className="text-center text-lg"
                maxLength={4}
              />
            </div>
            <div className="grid gap-1.5">
              <Label>Nom</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
          </div>

          <div className="grid gap-1.5">
            <Label>Couleur d'accent (optionnel)</Label>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setAccent("")}
                className={
                  "h-8 rounded-md border px-3 text-xs " +
                  (!accent
                    ? "border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]"
                    : "border-[var(--border)]")
                }
              >
                Par défaut
              </button>
              {PRESETS.map((p) => (
                <button
                  key={p.key}
                  type="button"
                  onClick={() => setAccent(p.hex)}
                  className={
                    "h-8 w-8 rounded-md border transition-all " +
                    (accent === p.hex
                      ? "border-[var(--foreground)] scale-110"
                      : "border-[var(--border)]")
                  }
                  style={{ background: p.hex }}
                  aria-label={p.label}
                />
              ))}
              <input
                type="color"
                value={accent || "#f43f5e"}
                onChange={(e) => setAccent(e.target.value)}
                className="h-8 w-8 cursor-pointer rounded-md border border-[var(--border)] bg-transparent"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <DialogClose asChild>
              <Button type="button" variant="ghost">
                Annuler
              </Button>
            </DialogClose>
            <Button type="submit">Enregistrer</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
