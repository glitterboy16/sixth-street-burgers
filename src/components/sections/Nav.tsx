"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Menu, Moon, Sun, X } from "lucide-react";
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
        href="#top"
        className="plate"
        aria-label="Sixth Street Burger Club, volver arriba"
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
        {/* sol = pasar a modo claro, luna = pasar a modo oscuro; los dos están siempre y el CSS cruza uno con otro */}
        <button
          type="button"
          className="nav__icon nav__theme"
          onClick={toggleTheme}
          aria-label={theme === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
          title={theme === "dark" ? "Modo claro" : "Modo oscuro"}
        >
          <Sun className="nav__ico nav__ico--sun" aria-hidden="true" />
          <Moon className="nav__ico nav__ico--moon" aria-hidden="true" />
        </button>
        <button
          type="button"
          className="nav__icon nav__burger"
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={open}
          aria-controls="nav-menu"
        >
          <Menu className="nav__ico nav__ico--menu" aria-hidden="true" />
          <X className="nav__ico nav__ico--close" aria-hidden="true" />
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
