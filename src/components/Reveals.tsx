"use client";

import { useEffect } from "react";

/**
 * Dispara cada [data-reveal] una sola vez cuando su borde superior pasa del 92 % del viewport.
 * Se observa el elemento padre (sin transformar): el propio elemento empieza desplazado fuera de su
 * contenedor recortado y nunca "intersecaría". Con prefers-reduced-motion se muestran todos de golpe.
 */
export default function Reveals() {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]:not([data-shown])"));
    const show = (el: Element) => el.setAttribute("data-shown", "1");

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      els.forEach(show);
      return;
    }

    const groups = new Map<Element, HTMLElement[]>();
    for (const el of els) {
      const target = el.parentElement ?? el;
      const list = groups.get(target);
      if (list) list.push(el);
      else groups.set(target, [el]);
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting || e.boundingClientRect.top < 0) {
            groups.get(e.target)?.forEach(show);
            io.unobserve(e.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0 },
    );

    // Lo que ya está por encima del 92 % al montar (recarga a mitad de página) se muestra sin esperar.
    const vh = window.innerHeight;
    groups.forEach((list, target) => {
      if (target.getBoundingClientRect().top < vh * 0.92) list.forEach(show);
      else io.observe(target);
    });
    return () => io.disconnect();
  }, []);

  return null;
}
