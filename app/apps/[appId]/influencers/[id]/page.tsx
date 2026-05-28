"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Pencil,
  Trash2,
  Wallet,
  PiggyBank,
  TrendingUp,
  Users,
  Eye,
  ShoppingCart,
  Target,
  UserPlus,
} from "lucide-react";
import { useAppById, useInfluencerById, useStore } from "@/lib/store";
import {
  coutAcqParUser,
  coutBrutParClient,
  coutInflu,
  marge,
  nbUserPar1000Vues,
  panierMoyen,
  revenuParUser,
  roi,
  rpmReel,
} from "@/lib/calc";
import { fmtEur, fmtNum, fmtPct } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MetricsGrid } from "@/components/metrics-grid";
import { InfluencerForm } from "@/components/influencer-form";
import { EmptyState } from "@/components/empty-state";

const PLATFORM_LABEL: Record<string, string> = {
  tiktok: "TikTok",
  instagram: "Instagram",
  youtube: "YouTube",
  snapchat: "Snapchat",
  x: "X",
  other: "Autre",
};

export default function InfluencerDetailPage({
  params,
}: {
  params: Promise<{ appId: string; id: string }>;
}) {
  const { appId, id } = use(params);
  const router = useRouter();
  const app = useAppById(appId);
  const inf = useInfluencerById(id);
  const deleteInfluencer = useStore((s) => s.deleteInfluencer);
  const [editing, setEditing] = useState(false);

  if (!app || !inf) {
    return (
      <div className="mx-auto max-w-5xl p-8">
        <EmptyState
          title="Influenceur introuvable"
          description="Cet influenceur n'existe plus."
          action={
            <Button asChild>
              <Link href="/">Retour au dashboard</Link>
            </Button>
          }
        />
      </div>
    );
  }

  const c = coutInflu(inf);
  const m = marge(inf);
  const r = roi(inf);

  return (
    <div className="mx-auto max-w-5xl p-4 sm:p-6 lg:p-8">
      <Link
        href={`/apps/${appId}`}
        className="mb-6 inline-flex items-center gap-1 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        {app.name}
      </Link>

      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <div className="mb-2 flex items-center gap-2">
            {inf.paymentType === "rpm" ? (
              <Badge variant="accent">
                RPM {inf.rpmGiven !== undefined ? `· ${inf.rpmGiven}€` : ""}
              </Badge>
            ) : (
              <Badge variant="outline">
                Forfait fixe {inf.fixedCost !== undefined ? `· ${fmtEur(inf.fixedCost)}` : ""}
              </Badge>
            )}
            {inf.platform && (
              <Badge variant="default">{PLATFORM_LABEL[inf.platform] ?? inf.platform}</Badge>
            )}
          </div>
          <h1 className="truncate text-2xl font-semibold tracking-tight sm:text-3xl">
            {inf.name}
          </h1>
          {inf.handle && (
            <div className="mt-1 text-sm text-[var(--muted-foreground)]">{inf.handle}</div>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setEditing(true)} className="flex-1 sm:flex-none">
            <Pencil className="h-4 w-4" />
            Modifier
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              if (confirm(`Supprimer ${inf.name} ?`)) {
                deleteInfluencer(inf.id);
                router.push(`/apps/${appId}`);
              }
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <MetricsGrid
        cols={4}
        metrics={[
          { label: "Revenu", value: fmtEur(inf.revenu), icon: Wallet, accent: true },
          { label: "Coût influ", value: fmtEur(c), icon: PiggyBank },
          {
            label: "Marge",
            value: fmtEur(m),
            icon: TrendingUp,
            trend: m !== null ? (m >= 0 ? "up" : "down") : "neutral",
          },
          {
            label: "ROI",
            value: fmtPct(r),
            icon: Target,
            trend: r !== null ? (r >= 0 ? "up" : "down") : "neutral",
          },
        ]}
      />

      <h2 className="mt-10 mb-3 text-lg font-semibold tracking-tight">Performance</h2>
      <MetricsGrid
        cols={3}
        metrics={[
          {
            label: "Revenu / user",
            value: fmtEur(revenuParUser(inf)),
            hint: "Revenu ÷ users inscrits",
          },
          {
            label: "Panier moyen",
            value: fmtEur(panierMoyen(inf)),
            hint: "Revenu ÷ nb clients",
          },
          {
            label: "RPM réel",
            value: fmtEur(rpmReel(inf)),
            hint: "Ce que TU fais réellement",
          },
        ]}
      />

      <h2 className="mt-8 mb-3 text-lg font-semibold tracking-tight">Acquisition</h2>
      <MetricsGrid
        cols={3}
        metrics={[
          {
            label: "Coût / user",
            value: fmtEur(coutAcqParUser(inf)),
            hint: "Coût influ ÷ users",
          },
          {
            label: "Coût / client",
            value: fmtEur(coutBrutParClient(inf)),
            hint: "Coût influ ÷ nb clients",
          },
          {
            label: "Users / 1000 vues",
            value: fmtNum(nbUserPar1000Vues(inf)),
            hint: "Taux de conversion vue → inscription",
          },
        ]}
      />

      <h2 className="mt-8 mb-3 text-lg font-semibold tracking-tight">Données brutes</h2>
      <Card className="p-5">
        <dl className="grid grid-cols-2 gap-y-3 text-sm sm:grid-cols-4">
          <Row label="Users" value={fmtNum(inf.users)} icon={UserPlus} />
          <Row label="Vues" value={fmtNum(inf.vues)} icon={Eye} />
          <Row label="Nb clients" value={fmtNum(inf.nbClients)} icon={ShoppingCart} />
          <Row label="Users total" value={fmtNum(inf.users)} icon={Users} />
        </dl>
      </Card>

      {inf.notes && (
        <>
          <h2 className="mt-8 mb-3 text-lg font-semibold tracking-tight">Notes</h2>
          <Card className="p-5 text-sm whitespace-pre-wrap text-[var(--foreground)]">
            {inf.notes}
          </Card>
        </>
      )}

      {editing && (
        <InfluencerForm
          appId={appId}
          initial={inf}
          open={editing}
          onOpenChange={setEditing}
        />
      )}
    </div>
  );
}

function Row({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="h-3.5 w-3.5 text-[var(--muted-foreground)]" />
      <div>
        <div className="text-[10px] uppercase tracking-wide text-[var(--muted-foreground)]">
          {label}
        </div>
        <div className="font-medium tabular-nums">{value}</div>
      </div>
    </div>
  );
}
