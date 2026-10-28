// Caja vertical de la hamburguesa en CADA fotograma exportado, para que el zoom del hero la mantenga siempre
// dentro de su caja (en mitad de la transición las capas ya están separadas pero el zoom de "cerrada" sigue
// alto, y la hamburguesa se salía por arriba y pisaba el texto en móvil).
//
//   node scripts/frame-boxes.mjs            → src/data/frames.ts (public/frames/d)
//   node scripts/frame-boxes.mjs --name dark → src/data/frames-dark.ts (public/frames/dark/d)
//
// Lee los webp del tamaño d (todos los fotogramas), mide filas con alfa > 40 y escribe `boxes` en el
// manifiesto: [[arriba, abajo], ...] en % del alto, un par por fotograma.

import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";

const arg = (k, d) => {
  const i = process.argv.indexOf(`--${k}`);
  return i > -1 ? process.argv[i + 1] : d;
};
const NAME = arg("name", "");
const DIR = path.resolve(NAME ? `public/frames/${NAME}/d` : "public/frames/d");
const MANIFEST = path.resolve(NAME ? `src/data/frames-${NAME}.ts` : "src/data/frames.ts");

const files = fs
  .readdirSync(DIR)
  .filter((f) => /^frame_\d{3}\.webp$/.test(f))
  .sort();
const boxes = [];
for (const f of files) {
  const { data, info } = await sharp(path.join(DIR, f)).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const w = info.width,
    h = info.height;
  let top = -1,
    bottom = -1;
  for (let y = 0; y < h && top < 0; y++) for (let x = 0; x < w; x++) if (data[(y * w + x) * 4 + 3] > 40) { top = y; break; }
  for (let y = h - 1; y >= 0 && bottom < 0; y--) for (let x = 0; x < w; x++) if (data[(y * w + x) * 4 + 3] > 40) { bottom = y; break; }
  boxes.push([Math.round((top / h) * 1000) / 10, Math.round((bottom / h) * 1000) / 10]);
}

let s = fs.readFileSync(MANIFEST, "utf8");
const line = `  /** caja vertical de la hamburguesa en cada fotograma [arriba, abajo], % del alto (scripts/frame-boxes.mjs) */\n  boxes: ${JSON.stringify(boxes)} as [number, number][],\n`;
if (/  boxes: /.test(s)) s = s.replace(/  \/\*\* caja vertical[^\n]*\n  boxes: [^\n]*\n/, line);
else s = s.replace(/  path: \(i: number/, line + "  path: (i: number");
fs.writeFileSync(MANIFEST, s);
console.log(`${files.length} fotogramas → ${path.basename(MANIFEST)}: primero ${boxes[0]}, último ${boxes[boxes.length - 1]}`);
