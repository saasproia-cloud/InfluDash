"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, Plus, Settings, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function Sidebar({
  mobileOpen,
  onMobileClose,
}: {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}) {
  const pathname = usePathname();
  const apps = useStore((s) => s.apps);

  useEffect(() => {
    onMobileClose?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <>
      {mobileOpen && (
        <div
          onClick={onMobileClose}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
        />
      )}
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 flex h-[100dvh] w-64 shrink-0 flex-col border-r border-[var(--border)] bg-[var(--subtle)] p-3 transition-transform md:relative md:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
      <div className="mb-4 flex items-center justify-between gap-2 px-2 py-3">
        <Wordmark />
        {onMobileClose && (
          <button
            onClick={onMobileClose}
            className="rounded-md p-1.5 text-[var(--muted-foreground)] hover:bg-[var(--muted)] md:hidden"
            aria-label="Fermer le menu"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <nav className="flex flex-col gap-1">
        <NavLink href="/" active={pathname === "/"} icon={<Home className="h-4 w-4" />}>
          Dashboard
        </NavLink>
      </nav>

      <div className="mt-6 mb-2 flex items-center justify-between px-2">
        <span className="text-[10px] font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
          Applications
        </span>
        <NewAppDialog />
      </div>

      <div className="flex flex-1 flex-col gap-0.5 overflow-y-auto">
        {apps.length === 0 ? (
          <div className="px-2 py-3 text-xs text-[var(--muted-foreground)]">
            Aucune app. Créez votre première application.
          </div>
        ) : (
          apps.map((a) => {
            const href = `/apps/${a.id}`;
            const active = pathname?.startsWith(href);
            return (
              <Link
                key={a.id}
                href={href}
                className={cn(
                  "flex items-center gap-2 rounded-md px-2 py-2 text-sm transition-colors",
                  active
                    ? "bg-[var(--accent)]/12 text-[var(--accent)]"
                    : "text-[var(--foreground)] hover:bg-[var(--muted)]"
                )}
                style={a.accentColor ? { color: active ? a.accentColor : undefined } : undefined}
              >
                <span className="text-base leading-none">{a.emoji || "📦"}</span>
                <span className="truncate">{a.name}</span>
              </Link>
            );
          })
        )}
      </div>

      <div className="mt-4 border-t border-[var(--border)] pt-3">
        <Link
          href="/settings"
          className={cn(
            "flex items-center gap-2 rounded-md px-2 py-2 text-sm transition-colors",
            pathname === "/settings"
              ? "bg-[var(--muted)] text-[var(--foreground)]"
              : "text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]"
          )}
        >
          <Settings className="h-4 w-4" />
          Réglages
        </Link>
      </div>
    </aside>
    </>
  );
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn("inline-flex items-baseline gap-0", className)}>
      <span className="text-xl font-bold tracking-tight text-[var(--foreground)]">Influ</span>
      <span className="text-xl font-bold tracking-tight text-[var(--accent)]">Dash</span>
    </Link>
  );
}

function NavLink({
  href,
  active,
  icon,
  children,
}: {
  href: string;
  active: boolean;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-2 rounded-md px-2 py-2 text-sm transition-colors",
        active
          ? "bg-[var(--accent)]/12 text-[var(--accent)]"
          : "text-[var(--foreground)] hover:bg-[var(--muted)]"
      )}
    >
      {icon}
      {children}
    </Link>
  );
}

function NewAppDialog() {
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
        <button
          className="rounded-md p-1 text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]"
          aria-label="Nouvelle application"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nouvelle application</DialogTitle>
          <DialogDescription>
            Une application regroupe ses propres influenceurs et statistiques.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="grid gap-4">
          <div className="grid gap-1.5">
            <Label htmlFor="app-emoji">Emoji</Label>
            <Input
              id="app-emoji"
              value={emoji}
              onChange={(e) => setEmoji(e.target.value)}
              maxLength={4}
              className="w-20 text-center text-lg"
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="app-name">Nom</Label>
            <Input
              id="app-name"
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
