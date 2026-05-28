"use client";

import { isSupabaseConfigured } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { LoginScreen } from "./login-screen";

export function AuthGate({ children }: { children: React.ReactNode }) {
  const status = useAuth((s) => s.status);

  // Local mode: no auth gate at all.
  if (!isSupabaseConfigured) return <>{children}</>;

  if (status === "loading") {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center text-[var(--muted-foreground)]">
        <div className="h-2 w-2 animate-pulse rounded-full bg-[var(--accent)]" />
      </div>
    );
  }

  if (status === "signed_out") return <LoginScreen />;

  return <>{children}</>;
}
