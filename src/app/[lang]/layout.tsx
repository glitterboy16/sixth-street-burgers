import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import Shell, { viewport as shellViewport } from "@/components/Shell";
import { DEFAULT_LANG, LANGS, isLang } from "@/i18n/config";

// Layout raíz de los idiomas con prefijo (/en/, /de/, /fr/, /it/). Cualquier otro prefijo da 404 (notFound).
export const viewport = shellViewport;

export function generateStaticParams() {
  return LANGS.filter((l) => l !== DEFAULT_LANG).map((lang) => ({ lang }));
}

export default async function LangLayout({ children, params }: { children: ReactNode; params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLang(lang) || lang === DEFAULT_LANG) notFound();
  return <Shell lang={lang}>{children}</Shell>;
}
