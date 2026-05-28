"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { fileToLogoDataUrl } from "@/lib/utils";

export function LogoPicker({
  logoUrl,
  emoji,
  onChange,
}: {
  logoUrl?: string;
  emoji: string;
  onChange: (logoUrl: string | undefined) => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  return (
    <div className="flex items-center gap-3">
      <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[var(--muted)] text-2xl">
        {logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logoUrl} alt="Logo" className="h-full w-full object-cover" />
        ) : (
          emoji || "📦"
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={busy}
          onClick={() => ref.current?.click()}
        >
          {busy ? "..." : logoUrl ? "Changer l'image" : "Choisir une image"}
        </Button>
        {logoUrl && (
          <Button type="button" variant="ghost" size="sm" onClick={() => onChange(undefined)}>
            Retirer
          </Button>
        )}
      </div>
      <input
        ref={ref}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={async (e) => {
          const f = e.target.files?.[0];
          e.target.value = "";
          if (!f) return;
          setBusy(true);
          try {
            onChange(await fileToLogoDataUrl(f));
          } finally {
            setBusy(false);
          }
        }}
      />
    </div>
  );
}
