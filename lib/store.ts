"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useShallow } from "zustand/react/shallow";
import type { App, ExportPayload, Influencer, Settings } from "./types";
import { uid } from "./utils";
import {
  cloudUpsertApp,
  cloudDeleteApp,
  cloudUpsertInfluencer,
  cloudDeleteInfluencer,
  cloudUpsertSettings,
  cloudReplaceAll,
} from "./cloud";

type State = {
  apps: App[];
  influencers: Influencer[];
  settings: Settings;
  hydrated: boolean;
  syncing: boolean;
};

type Actions = {
  setHydrated: (v: boolean) => void;
  setSyncing: (v: boolean) => void;

  addApp: (data: Omit<App, "id" | "createdAt">) => App;
  updateApp: (id: string, patch: Partial<App>) => void;
  deleteApp: (id: string) => void;

  addInfluencer: (data: Omit<Influencer, "id" | "createdAt">) => Influencer;
  updateInfluencer: (id: string, patch: Partial<Influencer>) => void;
  deleteInfluencer: (id: string) => void;

  setSettings: (patch: Partial<Settings>) => void;

  exportData: () => ExportPayload;
  importData: (payload: ExportPayload, mode: "replace" | "merge") => void;
  reset: () => void;

  // Bulk set from cloud (no echo back to cloud)
  setAllFromCloud: (data: {
    apps: App[];
    influencers: Influencer[];
    settings: Settings | null;
  }) => void;

  // Realtime appliers (no echo back to cloud)
  applyRemoteApp: (app: App) => void;
  applyRemoteAppDelete: (id: string) => void;
  applyRemoteInfluencer: (inf: Influencer) => void;
  applyRemoteInfluencerDelete: (id: string) => void;
  applyRemoteSettings: (s: Settings) => void;
};

const DEFAULT_SETTINGS: Settings = {
  themeMode: "dark",
  preset: "rose",
};

export const useStore = create<State & Actions>()(
  persist(
    (set, get) => ({
      apps: [],
      influencers: [],
      settings: DEFAULT_SETTINGS,
      hydrated: false,
      syncing: false,

      setHydrated: (v) => set({ hydrated: v }),
      setSyncing: (v) => set({ syncing: v }),

      addApp: (data) => {
        const app: App = { ...data, id: uid(), createdAt: new Date().toISOString() };
        set((s) => ({ apps: [...s.apps, app] }));
        void cloudUpsertApp(app);
        return app;
      },
      updateApp: (id, patch) => {
        set((s) => ({ apps: s.apps.map((a) => (a.id === id ? { ...a, ...patch } : a)) }));
        const app = get().apps.find((a) => a.id === id);
        if (app) void cloudUpsertApp(app);
      },
      deleteApp: (id) => {
        set((s) => ({
          apps: s.apps.filter((a) => a.id !== id),
          influencers: s.influencers.filter((i) => i.appId !== id),
        }));
        void cloudDeleteApp(id);
      },

      addInfluencer: (data) => {
        const inf: Influencer = { ...data, id: uid(), createdAt: new Date().toISOString() };
        set((s) => ({ influencers: [...s.influencers, inf] }));
        void cloudUpsertInfluencer(inf);
        return inf;
      },
      updateInfluencer: (id, patch) => {
        set((s) => ({
          influencers: s.influencers.map((i) => (i.id === id ? { ...i, ...patch } : i)),
        }));
        const inf = get().influencers.find((i) => i.id === id);
        if (inf) void cloudUpsertInfluencer(inf);
      },
      deleteInfluencer: (id) => {
        set((s) => ({ influencers: s.influencers.filter((i) => i.id !== id) }));
        void cloudDeleteInfluencer(id);
      },

      setSettings: (patch) => {
        set((s) => ({ settings: { ...s.settings, ...patch } }));
        void cloudUpsertSettings(get().settings);
      },

      exportData: () => {
        const s = get();
        return {
          version: 1,
          exportedAt: new Date().toISOString(),
          apps: s.apps,
          influencers: s.influencers,
          settings: s.settings,
        };
      },

      importData: (payload, mode) => {
        if (mode === "replace") {
          set({
            apps: payload.apps,
            influencers: payload.influencers,
            settings: payload.settings,
          });
          void cloudReplaceAll({
            apps: payload.apps,
            influencers: payload.influencers,
            settings: payload.settings,
          });
        } else {
          set((s) => {
            const appIds = new Set(s.apps.map((a) => a.id));
            const infIds = new Set(s.influencers.map((i) => i.id));
            const newApps = payload.apps.filter((a) => !appIds.has(a.id));
            const newInf = payload.influencers.filter((i) => !infIds.has(i.id));
            newApps.forEach((a) => void cloudUpsertApp(a));
            newInf.forEach((i) => void cloudUpsertInfluencer(i));
            return {
              apps: [...s.apps, ...newApps],
              influencers: [...s.influencers, ...newInf],
            };
          });
        }
      },

      reset: () => {
        set({ apps: [], influencers: [], settings: DEFAULT_SETTINGS });
        void cloudReplaceAll({ apps: [], influencers: [], settings: DEFAULT_SETTINGS });
      },

      setAllFromCloud: ({ apps, influencers, settings }) =>
        set((s) => ({
          apps,
          influencers,
          settings: settings ?? s.settings,
        })),

      applyRemoteApp: (app) =>
        set((s) => ({
          apps: s.apps.some((a) => a.id === app.id)
            ? s.apps.map((a) => (a.id === app.id ? app : a))
            : [...s.apps, app],
        })),
      applyRemoteAppDelete: (id) =>
        set((s) => ({
          apps: s.apps.filter((a) => a.id !== id),
          influencers: s.influencers.filter((i) => i.appId !== id),
        })),
      applyRemoteInfluencer: (inf) =>
        set((s) => ({
          influencers: s.influencers.some((i) => i.id === inf.id)
            ? s.influencers.map((i) => (i.id === inf.id ? inf : i))
            : [...s.influencers, inf],
        })),
      applyRemoteInfluencerDelete: (id) =>
        set((s) => ({ influencers: s.influencers.filter((i) => i.id !== id) })),
      applyRemoteSettings: (settings) => set({ settings }),
    }),
    {
      name: "influ-tracker-v1",
      partialize: (s) => ({
        apps: s.apps,
        influencers: s.influencers,
        settings: s.settings,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    }
  )
);

export function useAppById(appId: string | undefined) {
  return useStore((s) => (appId ? s.apps.find((a) => a.id === appId) : undefined));
}

export function useInfluencersByApp(appId: string | undefined) {
  return useStore(
    useShallow((s) => (appId ? s.influencers.filter((i) => i.appId === appId) : []))
  );
}

export function useInfluencerById(id: string | undefined) {
  return useStore((s) => (id ? s.influencers.find((i) => i.id === id) : undefined));
}
