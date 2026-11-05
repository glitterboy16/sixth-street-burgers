"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { Dict } from "./es";
import type { Lang } from "./config";

type Ctx = { lang: Lang; t: Dict };
const LangContext = createContext<Ctx | null>(null);

/** El layout mete aquí el idioma y SU diccionario (solo ese viaja al navegador, no los cinco). */
export function LangProvider({ lang, t, children }: Ctx & { children: ReactNode }) {
  return <LangContext.Provider value={{ lang, t }}>{children}</LangContext.Provider>;
}

export function useLang(): Ctx {
  const v = useContext(LangContext);
  if (!v) throw new Error("useLang fuera de LangProvider");
  return v;
}
