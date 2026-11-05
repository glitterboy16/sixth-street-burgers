// Idiomas de la web: los mismos cinco que Casa Tere y El Bocadito. El español vive en la raíz (/) y el resto
// bajo su prefijo (/en/, /de/, /fr/, /it/): así cada página llega ya en su idioma, sin cambiar textos tras cargar.
export const LANGS = ["es", "en", "de", "fr", "it"] as const;
export type Lang = (typeof LANGS)[number];
export const DEFAULT_LANG: Lang = "es";
export const STORAGE_KEY = "ssb-lang";

export const LANG_NAMES: Record<Lang, string> = {
  es: "Español",
  en: "English",
  de: "Deutsch",
  fr: "Français",
  it: "Italiano",
};

export const OG_LOCALE: Record<Lang, string> = {
  es: "es_ES",
  en: "en_GB",
  de: "de_DE",
  fr: "fr_FR",
  it: "it_IT",
};

export const isLang = (v: unknown): v is Lang => typeof v === "string" && (LANGS as readonly string[]).includes(v);

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/** Ruta de una página en un idioma: localePath("en", "/carta/") → "/en/carta/" (con el basePath delante). */
export function localePath(lang: Lang, path: "/" | "/carta/" = "/") {
  return `${BASE}${lang === DEFAULT_LANG ? "" : `/${lang}`}${path}`;
}

/** Portada del idioma (con ancla opcional): homeHref("de", "#local") → "/de/#local". */
export const homeHref = (lang: Lang, hash = "") => `${localePath(lang, "/")}${hash}`;
export const menuHref = (lang: Lang) => localePath(lang, "/carta/");
