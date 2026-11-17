// Exporta los fotogramas del hero "con fondo" (la Smash Burger real en el bar): WebP opacos, sin recorte.
//
//   node scripts/frames-foto.mjs --video ../renders/smash-fondo/05-A-2k-x2.mp4
//
// - El vídeo ya va de cerrada (primer fotograma) a abierta (último) y lleva el fondo del bar: un solo juego
//   sirve para el tema claro y el oscuro (la web funde los bordes de la foto con el fondo de la página).
// - Escribe public/frames/foto/{h,d,m}/frame_NNN.webp (1440×1920, 1080×1440, 720×960) y src/data/frames-foto.ts.
// - Las etiquetas (capa por capa) y el foco del zoom se midieron con BiRefNet sobre el primer y el último
//   fotograma (renders/smash-fondo/fr-2k/*-mask.png): están abajo como constantes.
import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { execFileSync } from "node:child_process";

const arg = (k, d) => {
  const i = process.argv.indexOf(`--${k}`);
  return i > -1 ? process.argv[i + 1] : d;
};
const VIDEO = path.resolve(arg("video", "../renders/smash-fondo/05-A-2k-x2.mp4"));
const OUT = path.resolve("public/frames/foto");
const MANIFEST = path.resolve("src/data/frames-foto.ts");
const STAMP = Date.now().toString(36);
const SIZES = { h: [1440, 1920, 76], d: [1080, 1440, 76], m: [720, 960, 74] };

// medido en el último fotograma (abierta): centro vertical de cada capa y su borde derecho, % del fotograma
const LABELS = [
  { y: 20.9, right: 75.6 }, // pan de arriba
  { y: 35.4, right: 69.6 }, // cebolla a la plancha con salsa
  { y: 48.5, right: 82.1 }, // doble smash con cheddar
  { y: 62.5, right: 77.8 }, // bacon
  { y: 74.5, right: 77.4 }, // pan de abajo con salsa
];
// caja de la hamburguesa cerrada (primer fotograma): [izq, arriba, der, abajo] %
const CLOSED = [10.1, 34.0, 87.2, 70.9];

const tmp = path.join(os.tmpdir(), "ssb-frames-foto");
fs.rmSync(tmp, { recursive: true, force: true });
fs.mkdirSync(tmp, { recursive: true });
console.log("extrayendo", VIDEO);
execFileSync("ffmpeg", ["-v", "error", "-y", "-i", VIDEO, "-fps_mode", "passthrough", path.join(tmp, "f_%04d.png")], { stdio: "inherit" });
const files = fs.readdirSync(tmp).filter((f) => f.endsWith(".png")).sort();
console.log(files.length, "fotogramas");

for (const s of Object.keys(SIZES)) {
  fs.rmSync(path.join(OUT, s), { recursive: true, force: true });
  fs.mkdirSync(path.join(OUT, s), { recursive: true });
}
let done = 0;
await Promise.all(
  Array.from({ length: 6 }, async (_, w) => {
    for (let i = w; i < files.length; i += 6) {
      const src = path.join(tmp, files[i]);
      for (const [s, [W, H, q]] of Object.entries(SIZES)) {
        await sharp(src)
          .resize(W, H, { fit: "fill", kernel: "lanczos3" })
          .webp({ quality: q, effort: 5, smartSubsample: true })
          .toFile(path.join(OUT, s, `frame_${String(i).padStart(3, "0")}.webp`));
      }
      if (++done % 25 === 0) console.log(" ", done, "/", files.length);
    }
  }),
);

const sizes = {};
for (const [s, [W, H]] of Object.entries(SIZES)) sizes[s] = { width: W, height: H, count: files.length };
fs.writeFileSync(
  MANIFEST,
  `// Generado por scripts/frames-foto.mjs — no editar a mano. Porcentajes respecto al fotograma 3:4.
// La Smash Burger real en el bar (fondo incluido): de cerrada (0) a abierta (último), un solo juego para los dos temas.
export type FotoSize = "h" | "d" | "m";

export const FRAMES_FOTO = {
  sizes: ${JSON.stringify(sizes)} as Record<FotoSize, { width: number; height: number; count: number }>,
  /** caja de la hamburguesa cerrada (primer fotograma): [izquierda, arriba, derecha, abajo] */
  closed: ${JSON.stringify(CLOSED)} as [number, number, number, number],
  /** etiquetas de la abierta: centro vertical de cada capa y su borde derecho */
  labels: ${JSON.stringify(LABELS)},
  path: (i: number, size: FotoSize) => \`/frames/foto/\${size}/frame_\${String(i).padStart(3, "0")}.webp?v=${STAMP}\`,
};
`,
);
for (const s of Object.keys(SIZES)) {
  const dir = path.join(OUT, s);
  const total = fs.readdirSync(dir).reduce((a, f) => a + fs.statSync(path.join(dir, f)).size, 0);
  console.log(s, (total / 1024 / 1024).toFixed(1), "MB");
}
fs.rmSync(tmp, { recursive: true, force: true });
