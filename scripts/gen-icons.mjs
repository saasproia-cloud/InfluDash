// Generates PWA icons from an SVG source.
// Run: node scripts/gen-icons.mjs
import sharp from "sharp";
import { writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, "..", "public");

const ACCENT = "#f43f5e";
const BG = "#09090b";
const FG = "#fafafa";

function svg({ size, maskable = false, transparent = false }) {
  const pad = maskable ? Math.round(size * 0.12) : 0;
  const innerSize = size - pad * 2;
  // Letters "ID" (Influ + Dash initials), Influ in white, Dash in accent
  const fontSize = Math.round(innerSize * 0.5);
  const cx = size / 2;
  const cy = size / 2 + fontSize * 0.18; // visually center text
  const radius = maskable ? size * 0.5 : size * 0.22;
  const bg = transparent ? "none" : BG;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="grad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${ACCENT}" stop-opacity="0.12"/>
      <stop offset="100%" stop-color="${ACCENT}" stop-opacity="0.04"/>
    </linearGradient>
  </defs>
  ${
    transparent
      ? ""
      : `<rect x="0" y="0" width="${size}" height="${size}" rx="${radius}" fill="${bg}"/>` +
        `<rect x="0" y="0" width="${size}" height="${size}" rx="${radius}" fill="url(#grad)"/>`
  }
  <text x="${cx}" y="${cy}" text-anchor="middle" font-family="-apple-system, system-ui, Helvetica, Arial, sans-serif" font-weight="800" font-size="${fontSize}" letter-spacing="-${Math.round(fontSize * 0.04)}">
    <tspan fill="${FG}">I</tspan><tspan fill="${ACCENT}">D</tspan>
  </text>
</svg>`;
}

const targets = [
  { name: "icon-192.png", size: 192 },
  { name: "icon-512.png", size: 512 },
  { name: "icon-maskable-512.png", size: 512, maskable: true },
  { name: "apple-touch-icon.png", size: 180 },
];

for (const t of targets) {
  const src = Buffer.from(svg(t));
  await sharp(src).png().toFile(join(publicDir, t.name));
  console.log("✓", t.name);
}

// Write the SVG source for reuse (favicon, etc.)
writeFileSync(join(publicDir, "icon.svg"), svg({ size: 512 }));
console.log("✓ icon.svg");
