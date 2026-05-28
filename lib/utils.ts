import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function uid() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

const eur = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 2,
});

const number = new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 2 });

export function fmtEur(v: number | null | undefined) {
  if (v === null || v === undefined || !Number.isFinite(v)) return "—";
  return eur.format(v);
}

export function fmtNum(v: number | null | undefined) {
  if (v === null || v === undefined || !Number.isFinite(v)) return "—";
  return number.format(v);
}

export function fmtPct(v: number | null | undefined) {
  if (v === null || v === undefined || !Number.isFinite(v)) return "—";
  return `${number.format(v)} %`;
}

/** Read an image File, downscale so its longest side ≤ max, return a PNG data URL. */
export async function fileToLogoDataUrl(file: File, max = 256): Promise<string> {
  const src = await new Promise<string>((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = () => reject(r.error);
    r.readAsDataURL(file);
  });
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const i = new Image();
    i.onload = () => resolve(i);
    i.onerror = () => reject(new Error("image load failed"));
    i.src = src;
  });
  const scale = Math.min(1, max / Math.max(img.width, img.height));
  const w = Math.max(1, Math.round(img.width * scale));
  const h = Math.max(1, Math.round(img.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return src;
  ctx.drawImage(img, 0, 0, w, h);
  return canvas.toDataURL("image/png");
}
