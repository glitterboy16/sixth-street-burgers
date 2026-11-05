import es, { type Dict } from "./es";
import en from "./en";
import de from "./de";
import fr from "./fr";
import it from "./it";
import { schedule } from "@/data/site";
import type { Lang } from "./config";

export type { Dict };
export * from "./config";

const DICTS: Record<Lang, Dict> = { es, en, de, fr, it };

/** Diccionario completo de un idioma (componentes de servidor). Los de cliente lo reciben por useLang(). */
export const dict = (lang: Lang): Dict => DICTS[lang];

/** Líneas de horario en el idioma: "Lun–Jue 13:00–23:30" … */
export const hoursLines = (lang: Lang) =>
  schedule.map((s, i) => `${DICTS[lang].schedule[i] ?? s.label} ${s.open}–${s.close}`);
