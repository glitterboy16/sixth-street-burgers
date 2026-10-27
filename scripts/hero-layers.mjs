// Capas del hero a partir del render del despiece (fondo rosa liso):
//
//   node scripts/hero-layers.mjs --open <despiece.png> [--split 3:auto:1.1] [--width 1800] [--tag -v2]
//
// - Aplica el matte de scripts/key.mjs al render.
// - Saca las bandas verticales de píxeles opacos (una por capa, de arriba abajo). Si dos capas se tocan
//   (las gotas de queso sobre la carne), --split N:P[:T] parte la banda N por la fila P (% del alto, o
//   "auto" = la fila más estrecha de la banda). Con T (% del alto), las gotas que cruzan la fila P NO se
//   cortan en recto: la capa de arriba las conserva hasta T más abajo con punta redondeada (semielipse bajo
//   cada gota) y la capa de abajo conserva esos mismos píxeles, que quedan tapados cuando las capas se
//   juntan. Así el queso termina en gotas y no en una línea.
// - Exporta cada capa a public/images/hero/capa-N.webp con el ancho completo del fotograma: todas
//   comparten el eje horizontal y la web solo las mueve en vertical.
// - Escribe src/data/hero.ts (tamaño del fotograma y caja de cada capa en % del alto).
// - Deja scripts/.hero-preview.png: capas abiertas | capas apiladas con los asientos de SEAT, compuestas
//   a partir de los webp exportados (lo que se ve es lo que se publica).

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
const WIDTH = Number(arg("width", 1800)); // la caja cerrada llega a ~1275 px CSS en escritorio
const TAG = arg("tag", ""); // sufijo de los archivos (p. ej. -v2): cambia el nombre al cambiar el render y la caché no mezcla versiones
const SPLITS = process.argv
  .map((v, i) => (v === "--split" ? process.argv[i + 1] : null))
  .filter(Boolean)
  .map((s) => s.split(":"));
// fracción de la capa inferior sobre la que apoya cada capa al cerrarse (misma lista que en Hero.tsx)
const SEAT = [0.6, 0.6, 0.55, 0.42];

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });
const pct = (v, total) => Math.round((v / total) * 100 * 100) / 100;
const cl = (v, a, b) => (v < a ? a : v > b ? b : v);

function rowCounts({ data, w, h }, th = 24) {
  const rows = new Array(h).fill(0);
  for (let y = 0; y < h; y++) {
    let c = 0;
    for (let x = 0; x < w; x++) if (data[(y * w + x) * 4 + 3] > th) c++;
    rows[y] = c;
  }
  return rows;
}

function bands(rows, h, minPx = 12, minGap = 10) {
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

// tramos opacos de una fila (gotas), unidos si el hueco entre ellos es mínimo
function runs({ data, w }, y, th = 24, minW = 12, join = 4) {
  const out = [];
  let s = -1;
  for (let x = 0; x <= w; x++) {
    const on = x < w && data[(y * w + x) * 4 + 3] > th;
    if (on && s < 0) s = x;
    if (!on && s >= 0) {
      const last = out[out.length - 1];
      if (last && s - last[1] <= join) last[1] = x - 1;
      else out.push([s, x - 1]);
      s = -1;
    }
  }
  return out.filter(([a, b]) => b - a + 1 >= minW);
}

const t0 = Date.now();
const open = await keyFrame(OPEN);
console.log(`matte: ${((Date.now() - t0) / 1000).toFixed(1)} s · fotograma ${open.w}×${open.h}`);
const raw = () => sharp(open.data, { raw: { width: open.w, height: open.h, channels: 4 } });

const rows = rowCounts(open);
let bs = bands(rows, open.h);
const tips = new Map(); // índice de capa → { row, depth } (gotas que cruzan la fila del corte)
for (const [n, p, t] of SPLITS) {
  const i = Number(n) - 1;
  const [a, b] = bs[i];
  let row;
  if (p === "auto") {
    // fila más estrecha, buscada lejos de los extremos de la banda
    row = a;
    let best = Infinity;
    for (let y = a + 20; y < b - 20; y++) if (rows[y] < best) (best = rows[y]), (row = y);
  } else row = Math.round((Number(p) / 100) * open.h);
  if (row <= a || row >= b) throw new Error(`--split ${n}:${p} fuera de la banda ${a}-${b}`);
  bs.splice(i, 1, [a, row - 1], [row, b]);
  if (t) tips.set(i, { row, depth: Math.round((Number(t) / 100) * open.h) });
  console.log(`split capa ${n} en la fila ${row} (${pct(row, open.h)} %)${t ? ` con gotas de ${t} %` : ""}`);
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
  const top = Math.max(0, a - Math.min(M, Math.floor(gapUp / 2)));
  let bottom = Math.min(open.h - 1, b + Math.min(M, Math.floor(gapDown / 2)));
  const tip = tips.get(i);
  let img = raw();
  if (tip) {
    // la capa sigue por debajo del corte, pero solo dentro de la semielipse de cada gota
    bottom = Math.min(open.h - 1, tip.row - 1 + tip.depth);
    const gotas = runs(open, tip.row - 1);
    console.log(`  gotas en la fila ${tip.row - 1}:`, gotas.map(([x0, x1]) => `${x0}–${x1}`).join(", ") || "ninguna");
    const buf = Buffer.from(open.data);
    for (let y = tip.row; y <= bottom; y++) {
      const dy = y - (tip.row - 1);
      for (let x = 0; x < open.w; x++) {
        let k = 0;
        for (const [x0, x1] of gotas) {
          const cx = (x0 + x1) / 2,
            rx = (x1 - x0) / 2 + 1.5;
          const e = Math.hypot((x - cx) / rx, dy / tip.depth);
          k = Math.max(k, cl((1 - e) * tip.depth * 0.7, 0, 1)); // pluma de ~1,5 px en la punta
        }
        const o = (y * open.w + x) * 4 + 3;
        buf[o] = Math.round(buf[o] * k);
      }
    }
    img = sharp(buf, { raw: { width: open.w, height: open.h, channels: 4 } });
  }
  const file = `capa-${i + 1}${TAG}.webp`;
  const o = await img
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

// --- previsualización con los webp exportados: abierta | apilada (asientos SEAT, capa superior delante)
{
  const W = 520;
  const H = Math.round((open.h / open.w) * W);
  const n = bs.length;
  const tops = new Array(n).fill(0);
  tops[n - 1] = bs[n - 1][0];
  for (let i = n - 2; i >= 0; i--) {
    const hb = bs[i + 1][1] - bs[i + 1][0];
    const bottom = tops[i + 1] + SEAT[i] * hb;
    tops[i] = bottom - (bs[i][1] - bs[i][0]);
  }
  const compose = async (shift) => {
    const comps = [];
    for (let i = n - 1; i >= 0; i--) {
      const buf = await sharp(path.join(OUT, layers[i].file)).resize({ width: W }).png().toBuffer();
      const top = Math.round(((layers[i].top + shift(i)) / 100) * H);
      comps.push({ input: buf, left: 0, top });
    }
    return sharp({ create: { width: W, height: H, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
      .composite(comps)
      .png()
      .toBuffer();
  };
  const openSmall = await compose(() => 0);
  const stacked = await compose((i) => pct(tops[i] - bs[i][0], open.h));
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
