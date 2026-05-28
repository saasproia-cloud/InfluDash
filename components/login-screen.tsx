"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

export function LoginScreen() {
  const signIn = useAuth((s) => s.signIn);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const err = await signIn(email.trim(), password);
    setLoading(false);
    if (err) setError(err);
  }

  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-[var(--background)] p-4">
      <Card className="w-full max-w-sm p-6 glow">
        <div className="mb-6 text-center">
          <div className="mb-2 inline-flex items-baseline gap-0 text-2xl font-bold tracking-tight">
            <span className="text-[var(--foreground)]">Influ</span>
            <span className="text-[var(--accent)]">Dash</span>
          </div>
          <p className="text-sm text-[var(--muted-foreground)]">
            Connecte-toi pour accéder à tes données.
          </p>
        </div>

        <form onSubmit={submit} className="grid gap-4">
          <div className="grid gap-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="toi@email.com"
              required
              autoFocus
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="password">Mot de passe</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <div className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-500">
              {error}
            </div>
          )}

          <Button type="submit" disabled={loading} className="w-full">
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Se connecter
          </Button>
        </form>

        <p className="mt-4 text-center text-[11px] leading-relaxed text-[var(--muted-foreground)]">
          Un seul compte pour tous tes appareils. Crée-le dans Supabase →
          Authentication → Users.
        </p>
      </Card>
    </div>
  );
}
