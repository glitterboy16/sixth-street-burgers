"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { nav } from "@/data/site";

type Theme = "dark" | "light";

const subscribeTheme = (cb: () => void) => {
  const mo = new MutationObserver(cb);
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => mo.disconnect();
};
const readTheme = (): Theme => (document.documentElement.dataset.theme === "light" ? "light" : "dark");

export default function Nav() {
  const theme = useSyncExternalStore(subscribeTheme, readTheme, () => "dark" as Theme);
  const [open, setOpen] = useState(false);
  const logo = useRef<HTMLAnchorElement>(null);

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
    const el = logo.current;
    if (el) {
      el.classList.remove("is-flickering");
      void el.offsetWidth;
      el.classList.add("is-flickering");
    }
  };

  return (
    <header className="nav">
      <a
        ref={logo}
        href="#top"
        className="plate"
        aria-label="Sixth Street Burgers, volver arriba"
        onAnimationEnd={(e) => e.currentTarget.classList.remove("is-flickering")}
      >
        <span className="plate__a">SIXTH STREET</span>
        <span className="plate__b">BURGERS</span>
      </a>

      <nav className="nav__links" aria-label="Secciones">
        {nav.map((n) => (
          <a key={n.href} href={n.href}>
            {n.label}
          </a>
        ))}
      </nav>

      <div className="nav__right">
        <a href="#visitanos" className="btn btn--primary btn--sm nav__cta">
          Pedir ahora
        </a>
        <button
          type="button"
          className="nav__icon"
          onClick={toggleTheme}
          aria-label={theme === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
          title="Modo claro / oscuro"
        >
          {theme === "dark" ? "○" : "●"}
        </button>
        <button
          type="button"
          className="nav__icon nav__burger"
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={open}
          aria-controls="nav-menu"
        >
          {open ? "✕" : "☰"}
        </button>
      </div>

      {open && (
        <div className="nav__menu" id="nav-menu">
          {nav.map((n) => (
            <a key={n.href} href={n.href} onClick={() => setOpen(false)}>
              {n.label}
            </a>
          ))}
          <a href="#visitanos" className="btn btn--primary" onClick={() => setOpen(false)}>
            Pedir ahora
          </a>
        </div>
      )}
    </header>
  );
}
