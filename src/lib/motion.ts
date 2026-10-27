export const NAV_H = 72;

export const clamp = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v);

/** smoothstep entre a y b */
export const sm = (p: number, a: number, b: number) => {
  const t = clamp((p - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};

export const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Progreso 0..1 de una sección con escenario sticky bajo la nav:
 * 0 cuando el top de la sección toca la nav, 1 cuando el escenario llega al final de la sección.
 */
export function stageProgress(section: HTMLElement, stage: HTMLElement) {
  const rc = section.getBoundingClientRect();
  return clamp((NAV_H - rc.top) / Math.max(1, rc.height - stage.offsetHeight), 0, 1);
}

/**
 * Llama a `cb` en el siguiente frame tras cada scroll / resize (coalescido con rAF) y una vez al suscribirse.
 * Devuelve la función para desuscribirse.
 */
export function onScroll(cb: () => void) {
  let raf = 0;
  const schedule = () => {
    if (raf) return;
    raf = requestAnimationFrame(() => {
      raf = 0;
      cb();
    });
  };
  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule);
  schedule();
  return () => {
    window.removeEventListener("scroll", schedule);
    window.removeEventListener("resize", schedule);
    if (raf) cancelAnimationFrame(raf);
  };
}

/** Observa cambios de tema (data-theme en <html>). */
export function onThemeChange(cb: () => void) {
  const mo = new MutationObserver(cb);
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => mo.disconnect();
}
