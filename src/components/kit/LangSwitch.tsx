"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { LANGS, LANG_NAMES, STORAGE_KEY, localePath, type Lang } from "@/i18n/config";
import { useLang } from "@/i18n/LangContext";

type Page = "/" | "/carta/";

/**
 * Selector de idioma de la nav: botón con el código (ES) y un menú con los cinco nombres. Son enlaces de verdad
 * (funcionan sin JS y los ve Google); al elegir se guarda la preferencia y se conserva la ancla de la página.
 */
export default function LangSwitch({ page }: { page: Page }) {
  const { lang, t } = useLang();
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!box.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const pick = (l: Lang) => (e: React.MouseEvent<HTMLAnchorElement>) => {
    try {
      localStorage.setItem(STORAGE_KEY, l);
    } catch {}
    e.preventDefault();
    window.location.href = localePath(l, page) + window.location.hash;
  };

  return (
    <div className="lang" ref={box}>
      <button
        type="button"
        className="nav__icon lang__btn"
        aria-label={`${t.common.language}: ${LANG_NAMES[lang]}`}
        aria-haspopup="true"
        aria-expanded={open}
        aria-controls="lang-menu"
        onClick={() => setOpen((o) => !o)}
      >
        <span className="lang__code" aria-hidden="true">
          {lang.toUpperCase()}
        </span>
        <ChevronDown className="lang__chev" aria-hidden="true" />
      </button>
      {open && (
        <ul className="lang__menu" id="lang-menu" aria-label={t.common.language}>
          {LANGS.map((l) => (
            <li key={l}>
              <a
                lang={l}
                hrefLang={l}
                href={localePath(l, page)}
                aria-current={l === lang ? "page" : undefined}
                onClick={pick(l)}
              >
                {LANG_NAMES[l]}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
