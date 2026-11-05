"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Menu, Moon, Sun, X } from "lucide-react";
import { homeHref, menuHref } from "@/i18n/config";
import { useLang } from "@/i18n/LangContext";
import LangSwitch from "@/components/kit/LangSwitch";

type Theme = "dark" | "light";
type Page = "/" | "/carta/";

const subscribeTheme = (cb: () => void) => {
  const mo = new MutationObserver(cb);
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => mo.disconnect();
};
const readTheme = (): Theme => (document.documentElement.dataset.theme === "light" ? "light" : "dark");

export default function Nav({ page }: { page: Page }) {
  const { lang, t } = useLang();
  const theme = useSyncExternalStore(subscribeTheme, readTheme, () => "dark" as Theme);
  const [open, setOpen] = useState(false);
  const logo = useRef<HTMLAnchorElement>(null);

  // "Carta" lleva a la página de la carta; el resto son anclas de la portada (desde /carta/ vuelven a ella)
  const links = [
    { label: t.nav.menu, href: menuHref(lang), current: page === "/carta/" },
    { label: t.nav.venue, href: homeHref(lang, "#local"), current: false },
    { label: t.nav.visit, href: homeHref(lang, "#visitanos"), current: false },
  ];
  const cta = homeHref(lang, "#visitanos");

  useEffect(() => {
    const wide = window.matchMedia("(min-width: 900px)");
    const onChange = () => {
      if (wide.matches) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    wide.addEventListener("change", onChange);
    window.addEventListener("keydown", onKey);
    return () => {
      wide.removeEventListener("change", onChange);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  const toggleTheme = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem("ssb-theme", next);
    } catch {}
    // de noche el letrero se enciende (chisporrotea y se queda fijo); de día es pintura mate y no hace nada
    const el = logo.current;
    if (el) {
      el.classList.remove("is-igniting");
      if (next === "dark") {
        void el.offsetWidth;
        el.classList.add("is-igniting");
      }
    }
  };

  return (
    <header className="nav">
      {/* Cada línea es un tubo de neón: el texto es el tubo (se ve apagado) y ::after (data-t) es su luz,
          que es lo único que parpadea. */}
      <a
        ref={logo}
        href={homeHref(lang, "#top")}
        className="plate"
        aria-label={t.common.logoAria}
        onAnimationEnd={(e) => {
          if (e.animationName === "neon-ignite" && (e.target as HTMLElement).classList.contains("plate__b"))
            e.currentTarget.classList.remove("is-igniting");
        }}
      >
        <span className="plate__a" data-t="SIXTH STREET">
          SIXTH STREET
        </span>
        <span className="plate__b" data-t="BURGER CLUB">
          BURGER CLUB
        </span>
      </a>

      <nav className="nav__links" aria-label={t.common.sections}>
        {links.map((n) => (
          <a key={n.href} href={n.href} aria-current={n.current ? "page" : undefined}>
            {n.label}
          </a>
        ))}
      </nav>

      <div className="nav__right">
        <a href={cta} className="btn btn--primary btn--sm nav__cta">
          {t.common.orderNow}
        </a>
        <LangSwitch page={page} />
        {/* sol = pasar a modo claro, luna = pasar a modo oscuro; los dos están siempre y el CSS cruza uno con otro */}
        <button
          type="button"
          className="nav__icon nav__theme"
          onClick={toggleTheme}
          aria-label={theme === "dark" ? t.common.toLight : t.common.toDark}
          title={theme === "dark" ? t.common.light : t.common.dark}
        >
          <Sun className="nav__ico nav__ico--sun" aria-hidden="true" />
          <Moon className="nav__ico nav__ico--moon" aria-hidden="true" />
        </button>
        <button
          type="button"
          className="nav__icon nav__burger"
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? t.common.closeMenu : t.common.openMenu}
          aria-expanded={open}
          aria-controls="nav-menu"
        >
          <Menu className="nav__ico nav__ico--menu" aria-hidden="true" />
          <X className="nav__ico nav__ico--close" aria-hidden="true" />
        </button>
      </div>

      {open && (
        <div className="nav__menu" id="nav-menu">
          {links.map((n) => (
            <a key={n.href} href={n.href} aria-current={n.current ? "page" : undefined} onClick={() => setOpen(false)}>
              {n.label}
            </a>
          ))}
          <a href={cta} className="btn btn--primary" onClick={() => setOpen(false)}>
            {t.common.orderNow}
          </a>
        </div>
      )}
    </header>
  );
}
