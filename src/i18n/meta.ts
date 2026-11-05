import type { Metadata } from "next";
import { site } from "@/data/site";
import { dict } from "./index";
import { LANGS, OG_LOCALE, localePath, type Lang } from "./config";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
export type Page = "/" | "/carta/";

/** Metadatos de una página en un idioma, con sus alternativas hreflang (x-default = español). */
export function pageMetadata(lang: Lang, page: Page): Metadata {
  const t = dict(lang);
  const title = page === "/" ? t.meta.title : t.meta.menuTitle;
  const description = page === "/" ? t.meta.description : t.meta.menuDescription;
  const languages: Record<string, string> = {};
  for (const l of LANGS) languages[l] = localePath(l, page);
  languages["x-default"] = localePath("es", page);
  return {
    metadataBase: new URL(SITE_URL),
    title,
    description,
    alternates: { canonical: localePath(lang, page), languages },
    openGraph: {
      title,
      description,
      siteName: site.name,
      url: localePath(lang, page),
      // vista previa al compartir el enlace (WhatsApp, Instagram…): si cambia, cambia también el nombre del archivo
      // para que las apps no sigan mostrando la versión que tienen en caché
      images: [{ url: `${BASE}/images/og-v3.jpg`, width: 1200, height: 630, alt: t.meta.ogAlt }],
      locale: OG_LOCALE[lang],
      alternateLocale: LANGS.filter((l) => l !== lang).map((l) => OG_LOCALE[l]),
      type: "website",
    },
  };
}
