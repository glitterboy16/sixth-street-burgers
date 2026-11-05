"use client";

import { useEffect } from "react";
import { isReady, markReady, onBoot } from "@/lib/boot";

// Cortina de carga: tapa la página con el letrero de neón encendiéndose hasta que lo que se ve arriba está listo
// de verdad (fuentes cargadas e hidratación hecha; en la portada, además, el primer fotograma de la hamburguesa
// pintado). Entonces se levanta y la portada entra con su escalera. Dura al menos MIN ms para que no sea un
// parpadeo y nunca más de MAX desde que empezó la navegación: si algo tarda, la página se enseña igual.
// Sin JavaScript no existe (html sin .js); el script del <head> tiene su propio tope por si el JS no llega.
const MIN = 550;
const MAX = 4500;

export default function Boot({ waitFrame = false }: { waitFrame?: boolean }) {
  useEffect(() => {
    const html = document.documentElement;
    let released = false;
    let timer = 0;
    const release = () => {
      if (released) return;
      released = true;
      html.classList.remove("is-booting");
      html.classList.add("is-ready");
    };
    const check = () => {
      if (released || timer) return;
      if (!isReady("fonts") || (waitFrame && !isReady("frame"))) return;
      timer = window.setTimeout(release, Math.max(0, MIN - performance.now()));
    };
    const off = onBoot(check);
    const fonts = (document as Document & { fonts?: FontFaceSet }).fonts;
    (fonts ? fonts.ready : Promise.resolve()).then(() => markReady("fonts"), () => markReady("fonts"));
    const max = window.setTimeout(release, Math.max(0, MAX - performance.now()));
    check();
    return () => {
      off();
      clearTimeout(max);
      clearTimeout(timer);
    };
  }, [waitFrame]);

  return (
    <div className="boot" aria-hidden="true">
      {/* el mismo letrero de la nav: tubos apagados y su luz encendiéndose a trompicones */}
      <div className="boot__plate plate is-igniting">
        <span className="plate__a" data-t="SIXTH STREET">
          SIXTH STREET
        </span>
        <span className="plate__b" data-t="BURGER CLUB">
          BURGER CLUB
        </span>
      </div>
      <div className="boot__bar">
        <span />
      </div>
    </div>
  );
}
