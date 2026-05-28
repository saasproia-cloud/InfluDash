"use client";

import { useState } from "react";
import type { Influencer, PaymentType, Platform } from "@/lib/types";
import { useStore } from "@/lib/store";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { coutInflu } from "@/lib/calc";
import { fmtEur } from "@/lib/utils";

type Draft = {
  name: string;
  handle: string;
  platform: Platform;
  launched: boolean;
  paymentType: PaymentType;
  rpmGiven: string;
  costPerVideo: string;
  nbVideos: string;
  revenu: string;
  users: string;
  vues: string;
  nbClients: string;
  notes: string;
};

function toDraft(i?: Partial<Influencer>): Draft {
  return {
    name: i?.name ?? "",
    handle: i?.handle ?? "",
    platform: i?.platform ?? "tiktok",
    launched: i?.launched ?? true,
    paymentType: i?.paymentType ?? "rpm",
    rpmGiven: i?.rpmGiven?.toString() ?? "",
    costPerVideo: i?.costPerVideo?.toString() ?? "",
    nbVideos: i?.nbVideos?.toString() ?? "",
    revenu: i?.revenu?.toString() ?? "",
    users: i?.users?.toString() ?? "",
    vues: i?.vues?.toString() ?? "",
    nbClients: i?.nbClients?.toString() ?? "",
    notes: i?.notes ?? "",
  };
}

function n(v: string): number | undefined {
  if (v === "") return undefined;
  const x = Number(v.replace(",", "."));
  return Number.isFinite(x) ? x : undefined;
}

function fromDraft(d: Draft): Omit<Influencer, "id" | "createdAt" | "appId"> {
  return {
    name: d.name.trim(),
    handle: d.handle.trim() || undefined,
    platform: d.platform,
    launched: d.launched,
    paymentType: d.paymentType,
    rpmGiven: d.paymentType === "rpm" ? n(d.rpmGiven) : undefined,
    costPerVideo: d.paymentType === "fixed" ? n(d.costPerVideo) : undefined,
    nbVideos: d.paymentType === "fixed" ? n(d.nbVideos) : undefined,
    revenu: n(d.revenu),
    users: n(d.users),
    vues: n(d.vues),
    nbClients: n(d.nbClients),
    notes: d.notes.trim() || undefined,
  };
}

export function InfluencerForm({
  appId,
  initial,
  open,
  onOpenChange,
}: {
  appId: string;
  initial?: Influencer;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const addInfluencer = useStore((s) => s.addInfluencer);
  const updateInfluencer = useStore((s) => s.updateInfluencer);
  const [d, setD] = useState<Draft>(() => toDraft(initial));

  function set<K extends keyof Draft>(k: K, v: Draft[K]) {
    setD((prev) => ({ ...prev, [k]: v }));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!d.name.trim()) return;
    const data = fromDraft(d);
    if (initial) {
      updateInfluencer(initial.id, data);
    } else {
      addInfluencer({ ...data, appId });
    }
    onOpenChange(false);
    if (!initial) setD(toDraft());
  }

  const previewCost = coutInflu({
    id: "",
    appId,
    name: "",
    paymentType: d.paymentType,
    rpmGiven: n(d.rpmGiven),
    costPerVideo: n(d.costPerVideo),
    nbVideos: n(d.nbVideos),
    vues: n(d.vues),
    createdAt: "",
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initial ? "Modifier l'influenceur" : "Nouvel influenceur"}</DialogTitle>
          <DialogDescription>
            Tous les champs sauf le nom sont optionnels. Les calculs ignorent les champs vides.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="grid gap-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Nom *">
              <Input
                value={d.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="ex: Tom"
                autoFocus
                required
              />
            </Field>
            <Field label="Handle">
              <Input
                value={d.handle}
                onChange={(e) => set("handle", e.target.value)}
                placeholder="@tomdaily"
              />
            </Field>
          </div>

          <Field label="Plateforme">
            <Select value={d.platform} onValueChange={(v) => set("platform", v as Platform)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tiktok">TikTok</SelectItem>
                <SelectItem value="instagram">Instagram</SelectItem>
                <SelectItem value="youtube">YouTube</SelectItem>
                <SelectItem value="snapchat">Snapchat</SelectItem>
                <SelectItem value="x">X / Twitter</SelectItem>
                <SelectItem value="other">Autre</SelectItem>
              </SelectContent>
            </Select>
          </Field>

          <Card className="p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-medium">Lancé avec l&apos;application</div>
                <div className="mt-0.5 text-xs text-[var(--muted-foreground)]">
                  {d.launched
                    ? "La campagne est en cours."
                    : "Pas encore lancé — tu pourras remplir les données plus tard."}
                </div>
              </div>
              <Switch
                checked={d.launched}
                onCheckedChange={(v) => set("launched", v)}
                aria-label="Influenceur lancé"
              />
            </div>
          </Card>

          <Card className="p-4">
            <div className="mb-3 text-xs font-medium uppercase tracking-wide text-[var(--muted-foreground)]">
              Mode de paiement
            </div>
            <div className="grid grid-cols-2 gap-2">
              <PayToggle
                active={d.paymentType === "rpm"}
                onClick={() => set("paymentType", "rpm")}
                title="Au RPM"
                hint="Je donne un RPM à l'influenceur"
              />
              <PayToggle
                active={d.paymentType === "fixed"}
                onClick={() => set("paymentType", "fixed")}
                title="Forfait fixe"
                hint="Un montant fixe convenu"
              />
            </div>

            {d.paymentType === "rpm" ? (
              <div className="mt-3 grid grid-cols-2 gap-3">
                <Field label="RPM donné (€)">
                  <Input
                    type="number"
                    step="0.01"
                    value={d.rpmGiven}
                    onChange={(e) => set("rpmGiven", e.target.value)}
                    placeholder="ex: 2"
                  />
                </Field>
                <Field label="Coût calculé">
                  <div className="flex h-9 items-center rounded-md border border-[var(--border)] bg-[var(--subtle)] px-3 text-sm tabular-nums">
                    {fmtEur(previewCost)}
                  </div>
                </Field>
              </div>
            ) : (
              <div className="mt-3 grid grid-cols-3 gap-3">
                <Field label="€ / vidéo">
                  <Input
                    type="number"
                    step="0.01"
                    value={d.costPerVideo}
                    onChange={(e) => set("costPerVideo", e.target.value)}
                    placeholder="ex: 50"
                  />
                </Field>
                <Field label="Nb vidéos">
                  <Input
                    type="number"
                    step="1"
                    value={d.nbVideos}
                    onChange={(e) => set("nbVideos", e.target.value)}
                    placeholder="ex: 3"
                  />
                </Field>
                <Field label="Coût total">
                  <div className="flex h-9 items-center rounded-md border border-[var(--border)] bg-[var(--subtle)] px-3 text-sm tabular-nums">
                    {fmtEur(previewCost)}
                  </div>
                </Field>
              </div>
            )}
          </Card>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Revenu (€)">
              <Input
                type="number"
                step="0.01"
                value={d.revenu}
                onChange={(e) => set("revenu", e.target.value)}
                placeholder="ex: 4971"
              />
            </Field>
            <Field label="Vues">
              <Input
                type="number"
                value={d.vues}
                onChange={(e) => set("vues", e.target.value)}
                placeholder="ex: 1200000"
              />
            </Field>
            <Field label="Users (inscrits)">
              <Input
                type="number"
                value={d.users}
                onChange={(e) => set("users", e.target.value)}
                placeholder="ex: 19565"
              />
            </Field>
            <Field label="Nb clients (payants)">
              <Input
                type="number"
                value={d.nbClients}
                onChange={(e) => set("nbClients", e.target.value)}
                placeholder="ex: 300"
              />
            </Field>
          </div>

          <Field label="Notes">
            <Textarea
              value={d.notes}
              onChange={(e) => set("notes", e.target.value)}
              placeholder="Contexte, deal particulier, etc."
            />
          </Field>

          <div className="flex justify-end gap-2 pt-2">
            <DialogClose asChild>
              <Button type="button" variant="ghost">
                Annuler
              </Button>
            </DialogClose>
            <Button type="submit" disabled={!d.name.trim()}>
              {initial ? "Enregistrer" : "Créer"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function PayToggle({
  active,
  onClick,
  title,
  hint,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  hint: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "rounded-md border p-3 text-left transition-all " +
        (active
          ? "border-[var(--accent)] bg-[var(--accent)]/8"
          : "border-[var(--border)] hover:border-[var(--muted-foreground)]")
      }
    >
      <div className={"text-sm font-medium " + (active ? "text-[var(--accent)]" : "")}>
        {title}
      </div>
      <div className="mt-0.5 text-xs text-[var(--muted-foreground)]">{hint}</div>
    </button>
  );
}
