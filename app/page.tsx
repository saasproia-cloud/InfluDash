"use client";

import { useStore } from "@/lib/store";
import { aggregate } from "@/lib/calc";
import { fmtEur, fmtNum, fmtPct } from "@/lib/utils";
import { MetricsGrid } from "@/components/metrics-grid";
import { AppCard } from "@/components/app-card";
import { EmptyState } from "@/components/empty-state";
import {
  Plus,
  TrendingUp,
  Wallet,
  Users,
  Eye,
  PiggyBank,
  ShoppingCart,
  Sparkles,
} from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const apps = useStore((s) => s.apps);
  const influencers = useStore((s) => s.influencers);
  const m = aggregate(influencers);

  return (
    <div className="mx-auto max-w-7xl p-4 sm:p-6 lg:p-8">
      <div className="mb-6 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Dashboard</h1>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            Vue d'ensemble de toutes vos applications et influenceurs.
          </p>
        </div>
        <NewAppButton />
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
          { label: "Clients", value: fmtNum(m.nbClients), icon: ShoppingCart },
        ]}
      />

      <div className="mt-10 mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold tracking-tight">Applications</h2>
        <span className="text-xs text-[var(--muted-foreground)]">
          {apps.length} app{apps.length > 1 ? "s" : ""} · {influencers.length} influenceur
          {influencers.length > 1 ? "s" : ""}
        </span>
      </div>

      {apps.length === 0 ? (
        <EmptyState
          icon={Sparkles}
          title="Aucune application"
          description="Commencez par créer une application pour ensuite y ajouter vos influenceurs."
          action={<NewAppButton />}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {apps.map((a) => (
            <AppCard
              key={a.id}
              app={a}
              influencers={influencers.filter((i) => i.appId === a.id)}
            />
          ))}
        </div>
      )}

      <div className="mt-12 flex items-center gap-2 text-xs text-[var(--muted-foreground)]">
        <Eye className="h-3.5 w-3.5" />
        Données stockées localement dans votre navigateur — pensez à exporter dans Réglages.
      </div>
    </div>
  );
}

function NewAppButton() {
  const router = useRouter();
  const addApp = useStore((s) => s.addApp);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("📱");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    const app = addApp({ name: name.trim(), emoji });
    setName("");
    setEmoji("📱");
    setOpen(false);
    router.push(`/apps/${app.id}`);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4" />
          Nouvelle app
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nouvelle application</DialogTitle>
          <DialogDescription>
            Regroupe ses propres influenceurs et statistiques.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="grid gap-4">
          <div className="grid gap-1.5">
            <Label htmlFor="dash-emoji">Emoji</Label>
            <Input
              id="dash-emoji"
              value={emoji}
              onChange={(e) => setEmoji(e.target.value)}
              maxLength={4}
              className="w-20 text-center text-lg"
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="dash-name">Nom</Label>
            <Input
              id="dash-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="ex: TikTok App"
              autoFocus
            />
          </div>
          <div className="flex justify-end gap-2">
            <DialogClose asChild>
              <Button type="button" variant="ghost">
                Annuler
              </Button>
            </DialogClose>
            <Button type="submit" disabled={!name.trim()}>
              Créer
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
