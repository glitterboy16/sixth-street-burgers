// Exporta un juego de fotogramas del hero a pantalla completa (la Smash Burger real en el bar, fondo incluido).
//
//   node scripts/frames-hero.mjs --set ancho --video ../renders/smash-fondo/video2/final-ancho.mp4 --meta ../renders/smash-fondo/video2/meta-ancho.json
//   node scripts/frames-hero.mjs --set alto  --video ../renders/smash-fondo/video2/final-alto.mp4  --meta ../renders/smash-fondo/video2/meta-alto.json
//
// - "ancho" = 16:9 (escritorio y tablet apaisada), "alto" = 9:16 (móvil y tablet de pie). La web elige por la
//   proporción de la pantalla y pinta el fotograma tipo "cover" con la hamburguesa en zona segura.
// - El vídeo va de cerrada (primer fotograma) a abierta (último). Fondo idéntico en los dos extremos: la mesa no se mueve.
// - meta.json (medido con BiRefNet sobre el primer y el último fotograma, en % del fotograma):
//     { "closed": [l, t, r, b], "open": [l, t, r, b], "labels": [{ "y": 20, "right": 70 }, ... 5] }
// - Escribe public/frames/<set>/{h,m}/frame_NNN.webp y src/data/hero-<set>.json.
import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { execFileSync } from "node:child_process";

const arg = (k, d) => {
  const i = process.argv.indexOf(`--${k}`);
  return i > -1 ? process.argv[i + 1] : d;
};
const SET = arg("set");
if (SET !== "ancho" && SET !== "alto") throw new Error("--set ancho | alto");
const VIDEO = path.resolve(arg("video"));
const META = JSON.parse(fs.readFileSync(path.resolve(arg("meta")), "utf8"));
const OUT = path.resolve(`public/frames/${SET}`);
const MANIFEST = path.resolve(`src/data/hero-${SET}.json`);
const STAMP = Date.now().toString(36);
// h: pantallas grandes o de alta densidad; m: el resto (la web elige según los píxeles reales del canvas)
const SIZES = SET === "ancho" ? { h: [1920, 1080, 74], m: [1280, 720, 74] } : { h: [1080, 1920, 74], m: [720, 1280, 72] };

const tmp = path.join(os.tmpdir(), `ssb-frames-${SET}`);
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
          .resize(W, H, { fit: "cover", kernel: "lanczos3" })
          .webp({ quality: q, effort: 5, smartSubsample: true })
          .toFile(path.join(OUT, s, `frame_${String(i).padStart(3, "0")}.webp`));
      }
      if (++done % 40 === 0) console.log(" ", done, "/", files.length);
    }
  }),
);

const sizes = {};
for (const [s, [W, H]] of Object.entries(SIZES)) sizes[s] = { width: W, height: H, count: files.length };
fs.writeFileSync(MANIFEST, JSON.stringify({ set: SET, stamp: STAMP, sizes, closed: META.closed, open: META.open, labels: META.labels }, null, 1) + "\n");
for (const s of Object.keys(SIZES)) {
  const dir = path.join(OUT, s);
  const total = fs.readdirSync(dir).reduce((a, f) => a + fs.statSync(path.join(dir, f)).size, 0);
  console.log(SET, s, (total / 1024 / 1024).toFixed(1), "MB");
}
fs.rmSync(tmp, { recursive: true, force: true });
