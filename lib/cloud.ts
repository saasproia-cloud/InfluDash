"use client";

import type { App, Influencer, Settings } from "./types";
import { supabase } from "./supabase";

/* ---------- Row <-> domain mapping (snake_case in DB) ---------- */

type AppRow = {
  id: string;
  name: string;
  emoji: string | null;
  logo_url: string | null;
  accent_color: string | null;
  created_at: string;
};

type InfluencerRow = {
  id: string;
  app_id: string;
  name: string;
  handle: string | null;
  platform: string | null;
  payment_type: string;
  rpm_given: number | null;
  cost_per_video: number | null;
  nb_videos: number | null;
  revenu: number | null;
  users: number | null;
  vues: number | null;
  nb_clients: number | null;
  notes: string | null;
  created_at: string;
};

type SettingsRow = {
  id: number;
  theme_mode: string | null;
  preset: string | null;
  custom_accent: string | null;
};

const num = (v: number | null | undefined) =>
  v === null || v === undefined ? null : v;

function rowToApp(r: AppRow): App {
  return {
    id: r.id,
    name: r.name,
    emoji: r.emoji ?? undefined,
    logoUrl: r.logo_url ?? undefined,
    accentColor: r.accent_color ?? undefined,
    createdAt: r.created_at,
  };
}

function appToRow(a: App): AppRow {
  return {
    id: a.id,
    name: a.name,
    emoji: a.emoji ?? null,
    logo_url: a.logoUrl ?? null,
    accent_color: a.accentColor ?? null,
    created_at: a.createdAt,
  };
}

function rowToInfluencer(r: InfluencerRow): Influencer {
  return {
    id: r.id,
    appId: r.app_id,
    name: r.name,
    handle: r.handle ?? undefined,
    platform: (r.platform as Influencer["platform"]) ?? undefined,
    paymentType: (r.payment_type as Influencer["paymentType"]) ?? "rpm",
    rpmGiven: r.rpm_given ?? undefined,
    costPerVideo: r.cost_per_video ?? undefined,
    nbVideos: r.nb_videos ?? undefined,
    revenu: r.revenu ?? undefined,
    users: r.users ?? undefined,
    vues: r.vues ?? undefined,
    nbClients: r.nb_clients ?? undefined,
    notes: r.notes ?? undefined,
    createdAt: r.created_at,
  };
}

function influencerToRow(i: Influencer): InfluencerRow {
  return {
    id: i.id,
    app_id: i.appId,
    name: i.name,
    handle: i.handle ?? null,
    platform: i.platform ?? null,
    payment_type: i.paymentType,
    rpm_given: num(i.rpmGiven),
    cost_per_video: num(i.costPerVideo),
    nb_videos: num(i.nbVideos),
    revenu: num(i.revenu),
    users: num(i.users),
    vues: num(i.vues),
    nb_clients: num(i.nbClients),
    notes: i.notes ?? null,
    created_at: i.createdAt,
  };
}

/* ---------- Reads ---------- */

export async function cloudFetchAll(): Promise<{
  apps: App[];
  influencers: Influencer[];
  settings: Settings | null;
}> {
  if (!supabase) return { apps: [], influencers: [], settings: null };

  const [appsRes, infRes, setRes] = await Promise.all([
    supabase.from("apps").select("*").order("created_at", { ascending: true }),
    supabase.from("influencers").select("*").order("created_at", { ascending: true }),
    supabase.from("settings").select("*").eq("id", 1).maybeSingle(),
  ]);

  if (appsRes.error) throw appsRes.error;
  if (infRes.error) throw infRes.error;

  const settingsRow = setRes.data as SettingsRow | null;
  const settings: Settings | null = settingsRow
    ? {
        themeMode: (settingsRow.theme_mode as Settings["themeMode"]) ?? "dark",
        preset: (settingsRow.preset as Settings["preset"]) ?? "rose",
        customAccent: settingsRow.custom_accent ?? undefined,
      }
    : null;

  return {
    apps: (appsRes.data as AppRow[]).map(rowToApp),
    influencers: (infRes.data as InfluencerRow[]).map(rowToInfluencer),
    settings,
  };
}

/* ---------- Writes ---------- */

export async function cloudUpsertApp(a: App) {
  if (!supabase) return;
  await supabase.from("apps").upsert(appToRow(a));
}

export async function cloudDeleteApp(id: string) {
  if (!supabase) return;
  await supabase.from("apps").delete().eq("id", id);
}

export async function cloudUpsertInfluencer(i: Influencer) {
  if (!supabase) return;
  await supabase.from("influencers").upsert(influencerToRow(i));
}

export async function cloudDeleteInfluencer(id: string) {
  if (!supabase) return;
  await supabase.from("influencers").delete().eq("id", id);
}

export async function cloudUpsertSettings(s: Settings) {
  if (!supabase) return;
  await supabase.from("settings").upsert({
    id: 1,
    theme_mode: s.themeMode,
    preset: s.preset,
    custom_accent: s.customAccent ?? null,
  });
}

export async function cloudReplaceAll(payload: {
  apps: App[];
  influencers: Influencer[];
  settings: Settings;
}) {
  if (!supabase) return;
  await supabase.from("influencers").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await supabase.from("apps").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  if (payload.apps.length) {
    await supabase.from("apps").upsert(payload.apps.map(appToRow));
  }
  if (payload.influencers.length) {
    await supabase.from("influencers").upsert(payload.influencers.map(influencerToRow));
  }
  await cloudUpsertSettings(payload.settings);
}

/* ---------- Realtime ---------- */

export type RealtimeHandlers = {
  onApp: (app: App) => void;
  onAppDelete: (id: string) => void;
  onInfluencer: (inf: Influencer) => void;
  onInfluencerDelete: (id: string) => void;
  onSettings: (s: Settings) => void;
};

export function cloudSubscribe(h: RealtimeHandlers): () => void {
  const sb = supabase;
  if (!sb) return () => {};

  const channel = sb
    .channel("infludash-sync")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "apps" },
      (payload) => {
        if (payload.eventType === "DELETE") {
          h.onAppDelete((payload.old as { id: string }).id);
        } else {
          h.onApp(rowToApp(payload.new as AppRow));
        }
      }
    )
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "influencers" },
      (payload) => {
        if (payload.eventType === "DELETE") {
          h.onInfluencerDelete((payload.old as { id: string }).id);
        } else {
          h.onInfluencer(rowToInfluencer(payload.new as InfluencerRow));
        }
      }
    )
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "settings" },
      (payload) => {
        if (payload.eventType !== "DELETE") {
          const r = payload.new as SettingsRow;
          h.onSettings({
            themeMode: (r.theme_mode as Settings["themeMode"]) ?? "dark",
            preset: (r.preset as Settings["preset"]) ?? "rose",
            customAccent: r.custom_accent ?? undefined,
          });
        }
      }
    )
    .subscribe();

  return () => {
    sb.removeChannel(channel);
  };
}
