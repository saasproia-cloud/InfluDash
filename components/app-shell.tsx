"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { Sidebar, Wordmark } from "./sidebar";
import { useStore } from "@/lib/store";

export function AppShell({ children }: { children: React.ReactNode }) {
  const hydrated = useStore((s) => s.hydrated);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-[100dvh]">
      <Sidebar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />
      <main className="flex min-h-[100dvh] flex-1 flex-col overflow-x-hidden">
        <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-[var(--border)] bg-[var(--background)]/85 px-4 py-3 backdrop-blur-md md:hidden">
          <button
            onClick={() => setMobileOpen(true)}
            className="rounded-md p-1.5 text-[var(--foreground)] hover:bg-[var(--muted)]"
            aria-label="Ouvrir le menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <Wordmark />
          <span className="w-7" aria-hidden />
        </header>
        {!hydrated ? (
          <div className="flex flex-1 items-center justify-center text-[var(--muted-foreground)]">
            <div className="h-2 w-2 animate-pulse rounded-full bg-[var(--accent)]" />
          </div>
        ) : (
          <div className="flex-1">{children}</div>
        )}
      </main>
    </div>
  );
}
