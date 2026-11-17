// Lee FAL_KEY de .env.local (con o sin comillas simples/dobles) sin imprimirla nunca.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
export function falKey() {
  const raw = fs.readFileSync(path.join(here, "..", ".env.local"), "utf8");
  const m = raw.match(/^\s*FAL_KEY\s*=\s*(.+)$/m);
  if (!m) throw new Error("No hay FAL_KEY en .env.local");
  return m[1].trim().replace(/^["']+|["']+$/g, "").trim();
}
