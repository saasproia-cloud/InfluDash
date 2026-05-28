"use client";

import { useEffect } from "react";
import { useStore } from "@/lib/store";
import { getPresetHex, rgbString, withAlpha } from "@/lib/presets";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const settings = useStore((s) => s.settings);
  const hydrated = useStore((s) => s.hydrated);

  useEffect(() => {
    if (!hydrated) return;
    const root = document.documentElement;
    if (settings.themeMode === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
  }, [settings.themeMode, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    const hex = getPresetHex(settings.preset, settings.customAccent);
    const root = document.documentElement;
    root.style.setProperty("--accent", hex);
    root.style.setProperty("--accent-rgb", rgbString(hex));
    root.style.setProperty("--accent-soft", withAlpha(hex, 0.12));
  }, [settings.preset, settings.customAccent, hydrated]);

  return <>{children}</>;
}
