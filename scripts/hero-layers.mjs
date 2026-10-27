// Capas del hero a partir del render del despiece (fondo rosa liso):
//
//   node scripts/hero-layers.mjs --open <despiece.png> [--split 3:52.57] [--width 1400]
//
// - Aplica el matte de scripts/key.mjs al render.
// - Saca las bandas verticales de píxeles opacos (una por capa, de arriba abajo). Si dos capas se tocan
//   (las gotas de queso sobre la carne), --split N:P parte la banda N por la fila P (% del alto).
// - Exporta cada capa a public/images/hero/capa-N.webp con el ancho completo del fotograma: todas
//   comparten el eje horizontal y la web solo las mueve en vertical.
// - Escribe src/data/hero.ts (tamaño del fotograma y caja de cada capa en % del alto).
// - Deja scripts/.hero-preview.png: capas abiertas | capas apiladas con los asientos de SEAT.

import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";
import { keyFrame } from "./key.mjs";

const arg = (k, d) => {
  const i = process.argv.indexOf(`--${k}`);
  return i > -1 ? process.argv[i + 1] : d;
};
const OPEN = path.resolve(arg("open"));
const OUT = path.resolve("public/images/hero");
const WIDTH = Number(arg("width", 1400)); // el fotograma en pantalla no pasa de ~750 px CSS
const SPLITS = process.argv
  .map((v, i) => (v === "--split" ? process.argv[i + 1] : null))
  .filter(Boolean)
  .map((s) => s.split(":").map(Number));
// fracción de la capa inferior sobre la que apoya cada capa al cerrarse (misma lista que en Hero.tsx)
const SEAT = [0.6, 0.6, 0.55, 0.42];

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });
const pct = (v, total) => Math.round((v / total) * 100 * 100) / 100;

function bands({ data, w, h }, th = 24, minPx = 12, minGap = 10) {
  const rows = new Array(h).fill(0);
  for (let y = 0; y < h; y++) {
    let c = 0;
    for (let x = 0; x < w; x++) if (data[(y * w + x) * 4 + 3] > th) c++;
    rows[y] = c;
  }
  const raw = [];
  let start = -1;
  for (let y = 0; y <= h; y++) {
    const on = y < h && rows[y] >= minPx;
    if (on && start < 0) start = y;
    if (!on && start >= 0) {
      raw.push([start, y - 1]);
      start = -1;
    }
  }
  const out = [];
  for (const b of raw) {
    const last = out[out.length - 1];
    if (last && b[0] - last[1] <= minGap) last[1] = b[1];
    else out.push([...b]);
  }
  return out.filter(([a, b]) => b - a > 12);
}

const t0 = Date.now();
const open = await keyFrame(OPEN);
console.log(`matte: ${((Date.now() - t0) / 1000).toFixed(1)} s · fotograma ${open.w}×${open.h}`);
const raw = () => sharp(open.data, { raw: { width: open.w, height: open.h, channels: 4 } });

let bs = bands(open);
for (const [n, p] of SPLITS) {
  const i = n - 1;
  const row = Math.round((p / 100) * open.h);
  const [a, b] = bs[i];
  if (row <= a || row >= b) throw new Error(`--split ${n}:${p} fuera de la banda ${a}-${b}`);
  bs.splice(i, 1, [a, row - 1], [row, b]);
}
console.log(`${bs.length} capas:`, bs.map(([a, b]) => `${pct(a, open.h)}–${pct(b, open.h)} %`).join("  "));

// Margen de filas por capa (la pluma del matte), pero nunca más allá del hueco con la capa vecina: si dos
// capas se tocan (partidas con --split) el margen sería un filete de la otra capa, visible al cerrarse.
const M = 6;
const layers = [];
for (let i = 0; i < bs.length; i++) {
  const [a, b] = bs[i];
  const gapUp = i > 0 ? a - bs[i - 1][1] - 1 : M;
  const gapDown = i < bs.length - 1 ? bs[i + 1][0] - b - 1 : M;
  const top = Math.max(0, a - Math.min(M, Math.floor(gapUp / 2))),
    bottom = Math.min(open.h - 1, b + Math.min(M, Math.floor(gapDown / 2)));
  const file = `capa-${i + 1}.webp`;
  const o = await raw()
    .extract({ left: 0, top, width: open.w, height: bottom - top + 1 })
    .resize({ width: WIDTH })
    .webp({ quality: 86, alphaQuality: 92, effort: 5 })
    .toFile(path.join(OUT, file));
  let minX = open.w,
    maxX = 0;
  for (let y = a; y <= b; y++)
    for (let x = 0; x < open.w; x++)
      if (open.data[(y * open.w + x) * 4 + 3] > 24) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
      }
  layers.push({
    file,
    width: o.width,
    height: o.height,
    top: pct(top, open.h),
    h: pct(bottom - top + 1, open.h),
    band: [pct(a, open.h), pct(b, open.h)],
    x: [pct(minX, open.w), pct(maxX, open.w)],
  });
  console.log(`  ${file} ${o.width}×${o.height} (${(o.size / 1024).toFixed(0)} KB) banda ${layers[i].band.join("–")} %`);
}

fs.writeFileSync(
  path.resolve("src/data/hero.ts"),
  `// Generado por scripts/hero-layers.mjs — no editar a mano. Porcentajes respecto al fotograma 3:4.
export type HeroLayer = {
  file: string;
  width: number;
  height: number;
  /** borde superior de la imagen de la capa, % del alto del fotograma */
  top: number;
  /** alto de la imagen de la capa, % del alto del fotograma */
  h: number;
  /** banda de píxeles opacos [desde, hasta], % del alto */
  band: [number, number];
  /** extensión horizontal [desde, hasta], % del ancho */
  x: [number, number];
};

export const HERO = {
  frame: { width: ${open.w}, height: ${open.h} },
  layers: ${JSON.stringify(layers, null, 2).replace(/\n/g, "\n  ")} as HeroLayer[],
  path: (file: string) => \`/images/hero/\${file}\`,
};
`,
);

// --- previsualización: abierta | apilada (asientos SEAT, capa superior delante)
{
  const k = 0.3;
  const W = Math.round(open.w * k),
    H = Math.round(open.h * k);
  const openSmall = await raw().resize(W, H).png().toBuffer();
  const n = bs.length;
  const tops = new Array(n).fill(0);
  tops[n - 1] = bs[n - 1][0];
  for (let i = n - 2; i >= 0; i--) {
    const hb = bs[i + 1][1] - bs[i + 1][0];
    const bottom = tops[i + 1] + SEAT[i] * hb;
    tops[i] = bottom - (bs[i][1] - bs[i][0]);
  }
  const comps = [];
  for (let i = n - 1; i >= 0; i--) {
    const [a, b] = bs[i];
    const top = Math.max(0, a - M),
      bottom = Math.min(open.h - 1, b + M);
    const buf = await raw()
      .extract({ left: 0, top, width: open.w, height: bottom - top + 1 })
      .resize({ width: W })
      .png()
      .toBuffer();
    comps.push({ input: buf, left: 0, top: Math.round((tops[i] - (a - top)) * k) });
  }
  const stacked = await sharp({ create: { width: W, height: H, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite(comps)
    .png()
    .toBuffer();
  await sharp({ create: { width: W * 2 + 20, height: H, channels: 3, background: "#F6F1E7" } })
    .composite([
      { input: openSmall, left: 0, top: 0 },
      { input: stacked, left: W + 20, top: 0 },
    ])
    .png()
    .toFile(path.resolve("scripts/.hero-preview.png"));
  console.log(
    "cerrada: capas apiladas de",
    pct(tops[0], open.h),
    "% a",
    pct(tops[n - 1] + (bs[n - 1][1] - bs[n - 1][0]), open.h),
    "% del alto",
  );
}
console.log("ok → src/data/hero.ts, public/images/hero/, scripts/.hero-preview.png");
