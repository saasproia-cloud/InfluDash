"use client";

import { useEffect } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { useStore } from "@/lib/store";
import { cloudFetchAll, cloudSubscribe } from "@/lib/cloud";

export function DataProvider({ children }: { children: React.ReactNode }) {
  const status = useAuth((s) => s.status);
  const setSession = useAuth((s) => s.setSession);

  // Track Supabase auth session
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;
    let active = true;

    supabase.auth.getSession().then(({ data }) => {
      if (active) setSession(data.session?.user?.email ?? null);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session?.user?.email ?? null);
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, [setSession]);

  // When signed in (cloud mode): load data + subscribe to realtime
  useEffect(() => {
    if (!isSupabaseConfigured) return; // local mode: persist handles state
    if (status !== "signed_in") return;

    const store = useStore.getState();
    let unsub = () => {};
    let active = true;

    (async () => {
      store.setSyncing(true);
      try {
        const data = await cloudFetchAll();
        if (active) {
          store.setAllFromCloud(data);
          store.setHydrated(true);
        }
      } catch (e) {
        console.error("[InfluDash] cloud load failed", e);
      } finally {
        store.setSyncing(false);
      }

      unsub = cloudSubscribe({
        onApp: (app) => useStore.getState().applyRemoteApp(app),
        onAppDelete: (id) => useStore.getState().applyRemoteAppDelete(id),
        onInfluencer: (inf) => useStore.getState().applyRemoteInfluencer(inf),
        onInfluencerDelete: (id) => useStore.getState().applyRemoteInfluencerDelete(id),
        onSettings: (s) => useStore.getState().applyRemoteSettings(s),
      });
    })();

    return () => {
      active = false;
      unsub();
    };
  }, [status]);

  return <>{children}</>;
}
