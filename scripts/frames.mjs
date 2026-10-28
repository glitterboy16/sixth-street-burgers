// Preprocesa los fotogramas del hero (fondo rosa plano del vídeo) a WebP con alfa.
//
//   node scripts/frames.mjs [--video ../hd.mp4] [--src carpeta-de-jpg-o-png] [--n 0] [--nm 0]
//
// - La web no funde fotogramas vecinos (emborrona las capas en movimiento): se exportan TODOS los únicos
//   del vídeo en escritorio (--n 0 = todos, 145) y la mitad en móvil (--nm 0 = ⌈n/2⌉).
// - Fuente por defecto: ../hd.mp4 (1080×1440, 145 fotogramas), extraído a PNG sin pérdida con ffmpeg.
//   Con --src se usa una carpeta de JPG/PNG (p. ej. los ezgif del handoff, de peor calidad).
// - Quita los fotogramas duplicados consecutivos (ezgif repite uno de cada cinco).
// - El clip va de abierta (001) a cerrada (último): invierte el orden → frame_000 = cerrada.
// - Matte en scripts/key.mjs.
// - Escribe public/frames/d/frame_NNN.webp (escritorio, 1080×1440 nativo), public/frames/m/frame_NNN.webp
//   (móvil, 720×960), public/images/burger-cerrada.webp (1:1), public/images/burger-abierta.webp (3:4),
//   public/images/og.jpg y src/data/frames.ts.

import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { execFileSync } from "node:child_process";
import { keyFrame } from "./key.mjs";

const arg = (k, d) => {
  const i = process.argv.indexOf(`--${k}`);
  return i > -1 ? process.argv[i + 1] : d;
};
const VIDEO = process.argv.includes("--src") ? null : path.resolve(arg("video", "../hd.mp4"));
let SRC;
if (VIDEO) {
  if (!fs.existsSync(VIDEO)) throw new Error(`no existe ${VIDEO} (pásalo con --video o usa --src)`);
  SRC = path.join(os.tmpdir(), "ssb-hero-frames");
  fs.rmSync(SRC, { recursive: true, force: true });
  fs.mkdirSync(SRC, { recursive: true });
  console.log(`extrayendo ${VIDEO} → ${SRC}`);
  execFileSync("ffmpeg", ["-v", "error", "-y", "-i", VIDEO, "-fps_mode", "passthrough", path.join(SRC, "f_%04d.png")], {
    stdio: "inherit",
  });
} else {
  SRC = path.resolve(arg("src"));
}
const OUT = path.resolve("public/frames");
const IMG = path.resolve("public/images");
const N_ARG = Number(arg("n", 0));
const NM_ARG = Number(arg("nm", 0));
// --reverse 0: el clip ya va de cerrada a abierta (vídeo generado con frame inicial y final)
const REVERSE = arg("reverse", "1") !== "0";
// --stills 0: no toca burger-cerrada.webp, burger-abierta.webp ni og.jpg
const STILLS = arg("stills", "1") !== "0";
// --only-manifest 1: no reescribe los webp (solo keyea el primero y el último) y regenera src/data/frames.ts
const ONLY_MANIFEST = arg("only-manifest", "0") === "1";
// --split N:P parte la banda N del fotograma abierto por la fila P (% del alto) para las etiquetas: las gotas de
// queso tocan la carne y el matte las ve como una sola banda.
const SPLITS = process.argv.map((v, i) => (v === "--split" ? process.argv[i + 1] : null)).filter(Boolean).map((s) => s.split(":").map(Number));
const SIZES = {
  d: { w: 1080, h: 1440, quality: 76 },
  m: { w: 720, h: 960, quality: 78 },
};

const cl = (v, a, b) => (v < a ? a : v > b ? b : v);

if (!ONLY_MANIFEST) {
  fs.rmSync(OUT, { recursive: true, force: true });
  for (const s of Object.keys(SIZES)) fs.mkdirSync(path.join(OUT, s), { recursive: true });
}
fs.mkdirSync(IMG, { recursive: true });

// 1) lista única (sin duplicados consecutivos)
const files = fs
  .readdirSync(SRC)
  .filter((f) => /\.(jpe?g|png)$/i.test(f))
  .sort();
const uniq = [];
let prev = null;
for (const f of files) {
  const buf = await sharp(path.join(SRC, f)).resize(90, 120).raw().toBuffer();
  if (prev && buf.equals(prev)) continue;
  uniq.push(f);
  prev = buf;
}
console.log(`${files.length} fotogramas, ${uniq.length} únicos`);

// 2) invertir: índice 0 = cerrada
const ordered = REVERSE ? uniq.slice().reverse() : uniq.slice();
const N = N_ARG || ordered.length;
const NM = NM_ARG || Math.ceil(N / 2);
const pick = Array.from({ length: N }, (_, i) => ordered[Math.round((i * (ordered.length - 1)) / (N - 1))]);
// índice de escritorio de cada fotograma de móvil (submuestreo uniforme)
const mobileOf = new Map(Array.from({ length: NM }, (_, j) => [Math.round((j * (N - 1)) / (NM - 1)), j]));

function alphaBBox({ data, w, h }, th = 40) {
  let minX = w,
    minY = h,
    maxX = 0,
    maxY = 0;
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++)
      if (data[(y * w + x) * 4 + 3] > th) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
  return { minX, minY, maxX, maxY };
}

// Bandas verticales de píxeles opacos (para colocar las etiquetas del hero).
function bands({ data, w, h }, th = 40) {
  const rows = [];
  for (let y = 0; y < h; y++) {
    let c = 0;
    for (let x = 0; x < w; x++) if (data[(y * w + x) * 4 + 3] > th) c++;
    rows.push(c);
  }
  const res = [];
  let start = -1;
  for (let y = 0; y <= h; y++) {
    const on = y < h && rows[y] > 20;
    if (on && start < 0) start = y;
    if (!on && start >= 0) {
      if (y - start > 8) res.push([Math.round((start / h) * 1000) / 10, Math.round((y / h) * 1000) / 10]);
      start = -1;
    }
  }
  return res;
}

// 3) matte + export
let closed = null,
  open = null;
const t0 = Date.now();
for (let i = 0; i < N; i++) {
  if (ONLY_MANIFEST && i !== 0 && i !== N - 1) continue;
  // holeLight 4: el brillo casi blanco del pan de arriba es un hueco cerrado apenas más claro que el fondo rosa; con el
  // valor por defecto (12) el matte lo tomaba por fondo y dejaba un agujero oscuro en la cerrada.
  // holeMin 600: los huecos pequeños (puntos de brillo) se rellenan siempre; los huecos reales entre capas son mucho mayores.
  const k = await keyFrame(path.join(SRC, pick[i]), { shadowMax: Number(arg("shadow", 0)), holeLight: Number(arg("holeLight", 4)), holeMin: Number(arg("holeMin", 600)) });
  if (i === 0) closed = k;
  if (i === N - 1) open = k;
  const base = sharp(k.data, { raw: { width: k.w, height: k.h, channels: 4 } });
  const write = (s, idx) =>
    base
      .clone()
      .resize(SIZES[s].w, SIZES[s].h)
      .webp({ quality: SIZES[s].quality, alphaQuality: 90, effort: 5 })
      .toFile(path.join(OUT, s, `frame_${String(idx).padStart(3, "0")}.webp`));
  if (!ONLY_MANIFEST) {
    await write("d", i);
    if (mobileOf.has(i)) await write("m", mobileOf.get(i));
  }
  process.stdout.write(`\r${i + 1}/${N} ${pick[i]}   `);
}
console.log(`\n${((Date.now() - t0) / 1000).toFixed(0)} s`);

// 4) stills
if (STILLS) {
const cb = alphaBBox(closed);
const side = Math.round(Math.max(cb.maxX - cb.minX, cb.maxY - cb.minY) * 1.12);
const cx = (cb.minX + cb.maxX) / 2,
  cy = (cb.minY + cb.maxY) / 2;
const left = Math.round(cl(cx - side / 2, 0, closed.w - side)),
  top = Math.round(cl(cy - side / 2, 0, closed.h - side));
const crop = { left, top, width: Math.min(side, closed.w), height: Math.min(side, closed.h) };
await sharp(closed.data, { raw: { width: closed.w, height: closed.h, channels: 4 } })
  .extract(crop)
  .resize(1000, 1000, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .webp({ quality: 88, alphaQuality: 90 })
  .toFile(path.join(IMG, "burger-cerrada.webp"));

await sharp(open.data, { raw: { width: open.w, height: open.h, channels: 4 } })
  .resize(SIZES.d.w, SIZES.d.h)
  .webp({ quality: 88, alphaQuality: 90 })
  .toFile(path.join(IMG, "burger-abierta.webp"));

// OG 1200×630: hamburguesa cerrada a la derecha sobre negro
const burger = await sharp(closed.data, { raw: { width: closed.w, height: closed.h, channels: 4 } })
  .extract(crop)
  .resize(600, 600, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png()
  .toBuffer();
await sharp({ create: { width: 1200, height: 630, channels: 3, background: "#0B0A09" } })
  .composite([{ input: burger, left: 560, top: 15 }])
  .jpeg({ quality: 88 })
  .toFile(path.join(IMG, "og.jpg"));
}

// 5) manifiesto para el componente: tamaños, caja de la cerrada (fotograma 0) y bandas de la abierta (último)
const cb0 = alphaBBox(closed);
const openBands = bands(open);
for (const [n, p] of SPLITS) {
  const b = openBands[n - 1];
  if (!b || p <= b[0] || p >= b[1]) throw new Error(`--split ${n}:${p} fuera de la banda ${b}`);
  openBands.splice(n - 1, 1, [b[0], Math.round(p * 10) / 10], [Math.round(p * 10) / 10, b[1]]);
}
const closedBox = {
  top: Math.round((cb0.minY / closed.h) * 1000) / 10,
  bottom: Math.round((cb0.maxY / closed.h) * 1000) / 10,
  x: [Math.round((cb0.minX / closed.w) * 1000) / 10, Math.round((cb0.maxX / closed.w) * 1000) / 10],
};
fs.writeFileSync(
  path.resolve("src/data/frames.ts"),
  `// Generado por scripts/frames.mjs — no editar a mano. Porcentajes respecto al fotograma 3:4.
export type FrameSize = "d" | "m";

export const FRAMES = {
  sizes: {
    d: { width: ${SIZES.d.w}, height: ${SIZES.d.h}, count: ${N} },
    m: { width: ${SIZES.m.w}, height: ${SIZES.m.h}, count: ${NM} },
  },
  /** caja de píxeles opacos de la hamburguesa cerrada (fotograma 0), % del alto y del ancho */
  closed: ${JSON.stringify(closedBox)},
  /** bandas verticales de píxeles opacos del fotograma abierto (último), % del alto */
  openBands: ${JSON.stringify(openBands)} as [number, number][],
  path: (i: number, size: FrameSize) => \`/frames/\${size}/frame_\${String(i).padStart(3, "0")}.webp\`,
};
`,
);

for (const s of Object.keys(SIZES)) {
  const dir = path.join(OUT, s);
  const total = fs.readdirSync(dir).reduce((acc, f) => acc + fs.statSync(path.join(dir, f)).size, 0);
  console.log(`frames/${s}: ${s === "d" ? N : NM} × ${SIZES[s].w}×${SIZES[s].h} → ${(total / 1024 / 1024).toFixed(2)} MB`);
}
console.log("cerrada bbox %:", closedBox);
console.log("bandas cerrada:", bands(closed));
console.log("bandas abierta:", bands(open));
