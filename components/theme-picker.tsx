"use client";

import { useStore } from "@/lib/store";
import { PRESETS, getPresetHex } from "@/lib/presets";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Check, Moon, Sun } from "lucide-react";

export function ThemePicker() {
  const settings = useStore((s) => s.settings);
  const setSettings = useStore((s) => s.setSettings);

  return (
    <div className="grid gap-6">
      <Card className="p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <div className="font-medium">Mode d'affichage</div>
            <div className="text-xs text-[var(--muted-foreground)]">Clair ou sombre.</div>
          </div>
          <div className="flex items-center gap-2">
            <Sun className="h-4 w-4 text-[var(--muted-foreground)]" />
            <Switch
              checked={settings.themeMode === "dark"}
              onCheckedChange={(v) => setSettings({ themeMode: v ? "dark" : "light" })}
            />
            <Moon className="h-4 w-4 text-[var(--muted-foreground)]" />
          </div>
        </div>
      </Card>

      <Card className="p-5">
        <div className="mb-4">
          <div className="font-medium">Couleur d'accent</div>
          <div className="text-xs text-[var(--muted-foreground)]">
            Choisis une nuance pré-programmée ou ta propre couleur.
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
          {PRESETS.map((p) => {
            const active = settings.preset === p.key;
            return (
              <button
                key={p.key}
                type="button"
                onClick={() => setSettings({ preset: p.key })}
                className={
                  "group relative flex flex-col items-center gap-2 rounded-lg border p-3 transition-all " +
                  (active
                    ? "border-[var(--foreground)] bg-[var(--muted)]"
                    : "border-[var(--border)] hover:border-[var(--muted-foreground)]")
                }
              >
                <div
                  className="h-10 w-10 rounded-full border border-black/10 shadow-inner"
                  style={{ background: p.hex }}
                >
                  {active && (
                    <Check className="m-2.5 h-5 w-5 text-white drop-shadow" strokeWidth={3} />
                  )}
                </div>
                <span className="text-xs">{p.label}</span>
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => setSettings({ preset: "custom" })}
            className={
              "group relative flex flex-col items-center gap-2 rounded-lg border p-3 transition-all " +
              (settings.preset === "custom"
                ? "border-[var(--foreground)] bg-[var(--muted)]"
                : "border-[var(--border)] hover:border-[var(--muted-foreground)]")
            }
          >
            <div
              className="flex h-10 w-10 items-center justify-center rounded-full border border-black/10"
              style={{
                background:
                  "conic-gradient(from 180deg, #f43f5e, #f97316, #facc15, #22c55e, #3b82f6, #8b5cf6, #f43f5e)",
              }}
            >
              {settings.preset === "custom" && (
                <Check className="h-5 w-5 text-white drop-shadow" strokeWidth={3} />
              )}
            </div>
            <span className="text-xs">Custom</span>
          </button>
        </div>

        {settings.preset === "custom" && (
          <div className="mt-4 flex items-center gap-3">
            <input
              type="color"
              value={settings.customAccent ?? getPresetHex("custom", settings.customAccent)}
              onChange={(e) => setSettings({ customAccent: e.target.value })}
              className="h-10 w-16 cursor-pointer rounded-md border border-[var(--border)] bg-transparent"
            />
            <input
              type="text"
              value={settings.customAccent ?? "#f43f5e"}
              onChange={(e) => setSettings({ customAccent: e.target.value })}
              className="h-10 w-32 rounded-md border border-[var(--input)] bg-[var(--background)] px-3 font-mono text-sm"
              placeholder="#hex"
            />
          </div>
        )}
      </Card>
    </div>
  );
}
