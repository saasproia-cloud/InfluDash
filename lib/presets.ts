import type { PresetKey } from "./types";

export type Preset = {
  key: PresetKey;
  label: string;
  hex: string;
};

export const PRESETS: Preset[] = [
  { key: "rose", label: "Rose", hex: "#f43f5e" },
  { key: "ocean", label: "Ocean", hex: "#3b82f6" },
  { key: "forest", label: "Forest", hex: "#22c55e" },
  { key: "sunset", label: "Sunset", hex: "#f97316" },
  { key: "violet", label: "Violet", hex: "#8b5cf6" },
  { key: "mono", label: "Mono", hex: "#e5e7eb" },
];

export function getPresetHex(key: PresetKey, customAccent?: string): string {
  if (key === "custom") return customAccent || "#f43f5e";
  return PRESETS.find((p) => p.key === key)?.hex ?? "#f43f5e";
}

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  const v = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const n = parseInt(v, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function rgbString(hex: string) {
  const [r, g, b] = hexToRgb(hex);
  return `${r} ${g} ${b}`;
}

export function withAlpha(hex: string, alpha: number) {
  const [r, g, b] = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function isLight(hex: string) {
  const [r, g, b] = hexToRgb(hex);
  const luma = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luma > 0.6;
}
