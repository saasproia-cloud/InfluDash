"use client";

import { useRef, useState } from "react";
import {
  Download,
  Upload,
  Palette,
  Database,
  AlertTriangle,
  Cloud,
  CloudOff,
  LogOut,
  RefreshCw,
} from "lucide-react";
import { useStore } from "@/lib/store";
import type { ExportPayload } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ThemePicker } from "@/components/theme-picker";
import { isSupabaseConfigured } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";

export default function SettingsPage() {
  const exportData = useStore((s) => s.exportData);
  const importData = useStore((s) => s.importData);
  const reset = useStore((s) => s.reset);
  const apps = useStore((s) => s.apps);
  const influencers = useStore((s) => s.influencers);

  const syncing = useStore((s) => s.syncing);
  const email = useAuth((s) => s.email);
  const signOut = useAuth((s) => s.signOut);

  const fileRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<string | null>(null);

  function handleExport() {
    const data = exportData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const date = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `influ-tracker-backup-${date}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setStatus("Backup téléchargé.");
  }

  async function handleImport(file: File, mode: "replace" | "merge") {
    try {
      const text = await file.text();
      const payload = JSON.parse(text) as ExportPayload;
      if (!payload || payload.version !== 1 || !Array.isArray(payload.apps)) {
        throw new Error("Format invalide");
      }
      importData(payload, mode);
      setStatus(`Import ${mode === "replace" ? "(remplacement)" : "(fusion)"} effectué.`);
    } catch (err) {
      setStatus("Erreur d'import : " + (err as Error).message);
    }
  }

  function triggerImport(mode: "replace" | "merge") {
    const input = fileRef.current;
    if (!input) return;
    input.value = "";
    input.dataset.mode = mode;
    input.click();
  }

  return (
    <div className="mx-auto max-w-3xl p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Réglages</h1>
        <p className="mt-1 text-sm text-[var(--muted-foreground)]">
          Personnalise l'apparence et gère tes sauvegardes.
        </p>
      </div>

      <section className="mb-10">
        <div className="mb-3 flex items-center gap-2">
          <Palette className="h-4 w-4 text-[var(--muted-foreground)]" />
          <h2 className="text-lg font-semibold tracking-tight">Apparence</h2>
        </div>
        <ThemePicker />
      </section>

      <section className="mb-10">
        <div className="mb-3 flex items-center gap-2">
          {isSupabaseConfigured ? (
            <Cloud className="h-4 w-4 text-[var(--muted-foreground)]" />
          ) : (
            <CloudOff className="h-4 w-4 text-[var(--muted-foreground)]" />
          )}
          <h2 className="text-lg font-semibold tracking-tight">Synchronisation</h2>
        </div>
        <Card className="p-5">
          {isSupabaseConfigured ? (
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-500">
                  {syncing ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Cloud className="h-4 w-4" />
                  )}
                </span>
                <div>
                  <div className="text-sm font-medium">
                    {syncing ? "Synchronisation…" : "Cloud connecté"}
                  </div>
                  <div className="text-xs text-[var(--muted-foreground)]">
                    {email ?? "Compte partagé"} · changements en temps réel
                  </div>
                </div>
              </div>
              <Button variant="outline" onClick={() => signOut()} className="shrink-0">
                <LogOut className="h-4 w-4" />
                Se déconnecter
              </Button>
            </div>
          ) : (
            <div className="flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-500/15 text-amber-500">
                <CloudOff className="h-4 w-4" />
              </span>
              <div>
                <div className="text-sm font-medium">Mode local</div>
                <div className="mt-0.5 text-xs leading-relaxed text-[var(--muted-foreground)]">
                  Les données restent sur cet appareil uniquement. Pour synchroniser
                  entre ton téléphone et ton PC, configure Supabase (voir le README) puis
                  ajoute tes clés dans <code className="font-mono">.env.local</code>.
                </div>
              </div>
            </div>
          )}
        </Card>
      </section>

      <section className="mb-10">
        <div className="mb-3 flex items-center gap-2">
          <Database className="h-4 w-4 text-[var(--muted-foreground)]" />
          <h2 className="text-lg font-semibold tracking-tight">Sauvegarde</h2>
        </div>
        <Card className="p-5">
          <div className="grid gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-[var(--muted-foreground)]">Applications</span>
              <span className="font-medium tabular-nums">{apps.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--muted-foreground)]">Influenceurs</span>
              <span className="font-medium tabular-nums">{influencers.length}</span>
            </div>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            <Button onClick={handleExport}>
              <Download className="h-4 w-4" />
              Exporter JSON
            </Button>
            <Button variant="outline" onClick={() => triggerImport("merge")}>
              <Upload className="h-4 w-4" />
              Importer (fusionner)
            </Button>
            <Button variant="outline" onClick={() => triggerImport("replace")}>
              <Upload className="h-4 w-4" />
              Importer (remplacer)
            </Button>
            <input
              ref={fileRef}
              type="file"
              accept="application/json"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                const mode = (e.target.dataset.mode as "merge" | "replace") ?? "merge";
                if (file) handleImport(file, mode);
              }}
            />
          </div>
          {status && (
            <div className="mt-3 text-xs text-[var(--muted-foreground)]">{status}</div>
          )}
        </Card>
      </section>

      <section>
        <div className="mb-3 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-red-500" />
          <h2 className="text-lg font-semibold tracking-tight">Zone dangereuse</h2>
        </div>
        <Card className="border-red-500/30 p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="font-medium">Réinitialiser toutes les données</div>
              <div className="text-xs text-[var(--muted-foreground)]">
                Supprime toutes les applications et influenceurs. Exporte avant si besoin.
              </div>
            </div>
            <Button
              variant="danger"
              onClick={() => {
                if (
                  confirm(
                    "Confirmer la suppression de TOUTES les données ? (cette action est irréversible)"
                  )
                ) {
                  reset();
                  setStatus("Données réinitialisées.");
                }
              }}
            >
              Tout effacer
            </Button>
          </div>
        </Card>
      </section>
    </div>
  );
}
