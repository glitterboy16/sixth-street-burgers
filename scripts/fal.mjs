// Lanza un modelo de fal.ai, espera el resultado y descarga lo generado.
//   node scripts/fal.mjs <endpoint> <input.json> <carpeta-salida> [etiqueta] [coste-estimado-usd]
// En input.json, cualquier valor "file:ruta/local" se sube antes (data URI) y se sustituye por su URL.
// Cada ejecución se apunta en <carpeta-salida>/gastos.json (endpoint, request_id, coste estimado, archivos).
import fs from "node:fs";
import path from "node:path";
import { falKey } from "./fal-key.mjs";

const [endpoint, inputFile, outDir, tag = "out", cost = "0"] = process.argv.slice(2);
if (!endpoint || !inputFile || !outDir) {
  console.error("uso: node scripts/fal.mjs <endpoint> <input.json> <carpeta-salida> [etiqueta] [coste-usd]");
  process.exit(1);
}
const H = { Authorization: "Key " + falKey(), "Content-Type": "application/json" };
const MIME = { ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp", ".mp4": "video/mp4" };

// Sube un archivo local al almacenamiento de fal y devuelve su URL pública (si falla, usa data URI).
async function upload(file) {
  const buf = fs.readFileSync(file);
  const type = MIME[path.extname(file).toLowerCase()] || "application/octet-stream";
  try {
    const r = await fetch("https://rest.alpha.fal.ai/storage/upload/initiate?storage_type=fal-cdn-v3", {
      method: "POST",
      headers: H,
      body: JSON.stringify({ content_type: type, file_name: path.basename(file) }),
    });
    if (r.ok) {
      const { upload_url, file_url } = await r.json();
      const put = await fetch(upload_url, { method: "PUT", headers: { "Content-Type": type }, body: buf });
      if (put.ok) return file_url;
    }
  } catch {}
  return `data:${type};base64,${buf.toString("base64")}`;
}

async function resolveFiles(v) {
  if (typeof v === "string" && v.startsWith("file:")) return upload(v.slice(5));
  if (Array.isArray(v)) return Promise.all(v.map(resolveFiles));
  if (v && typeof v === "object") {
    const o = {};
    for (const [k, x] of Object.entries(v)) o[k] = await resolveFiles(x);
    return o;
  }
  return v;
}

const input = await resolveFiles(JSON.parse(fs.readFileSync(inputFile, "utf8")));
fs.mkdirSync(outDir, { recursive: true });

const sub = await fetch(`https://queue.fal.run/${endpoint}`, { method: "POST", headers: H, body: JSON.stringify(input) });
const job = await sub.json();
if (!sub.ok) {
  console.error("envío rechazado", sub.status, JSON.stringify(job).slice(0, 500));
  process.exit(1);
}
console.log("en cola:", job.request_id);

let status;
const t0 = Date.now();
for (;;) {
  await new Promise((r) => setTimeout(r, 4000));
  const s = await fetch(job.status_url, { headers: H });
  status = await s.json();
  if (status.status === "COMPLETED") break;
  if (Date.now() - t0 > 20 * 60 * 1000) throw new Error("más de 20 min esperando");
}
const res = await fetch(job.response_url, { headers: H });
const out = await res.json();
if (!res.ok) {
  console.error("falló", res.status, JSON.stringify(out).slice(0, 800));
  process.exit(1);
}

// descarga todo lo que tenga url (images[], image, video)
const urls = [];
const walk = (v) => {
  if (!v || typeof v !== "object") return;
  if (typeof v.url === "string" && /^https?:/.test(v.url)) urls.push(v);
  for (const x of Object.values(v)) walk(x);
};
walk(out);
const files = [];
for (let i = 0; i < urls.length; i++) {
  const u = urls[i];
  const ext = (u.content_type && u.content_type.split("/")[1]) || path.extname(new URL(u.url).pathname).slice(1) || "bin";
  const name = `${tag}${urls.length > 1 ? "-" + (i + 1) : ""}.${ext === "jpeg" ? "jpg" : ext}`;
  const b = Buffer.from(await (await fetch(u.url)).arrayBuffer());
  fs.writeFileSync(path.join(outDir, name), b);
  files.push(name);
}
console.log("listo en", Math.round((Date.now() - t0) / 1000), "s:", files.join(", "));
if (out.description) console.log("descripción:", String(out.description).slice(0, 300));

const ledger = path.join(outDir, "gastos.json");
const log = fs.existsSync(ledger) ? JSON.parse(fs.readFileSync(ledger, "utf8")) : [];
log.push({ when: new Date().toISOString(), endpoint, request_id: job.request_id, tag, cost_usd: Number(cost), files });
fs.writeFileSync(ledger, JSON.stringify(log, null, 2));
console.log("gastado en esta carpeta (estimado):", log.reduce((a, x) => a + x.cost_usd, 0).toFixed(2), "$");
