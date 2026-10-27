"use client";

import { useEffect, useRef } from "react";
import { clamp, onScroll } from "@/lib/motion";
import Corner from "@/components/kit/Corner";
import Line from "@/components/kit/Line";
import ImageSlot from "@/components/kit/ImageSlot";

export default function Macro() {
  const section = useRef<HTMLElement>(null);
  const img = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sec = section.current,
      el = img.current;
    if (!sec || !el) return;
    return onScroll(() => {
      const rc = sec.getBoundingClientRect();
      const vh = window.innerHeight;
      const v = clamp((vh - rc.top) / (vh + rc.height), 0, 1);
      el.style.transform = `scale(${1.08 - 0.08 * v})`;
    });
  }, []);

  return (
    <section ref={section} className="macro">
      <div ref={img} className="macro__img">
        <ImageSlot id="macro-queso-carne" fit="cover" sizes="100vw" />
      </div>
      <Corner pos="tl">10 — De cerca</Corner>
      <Corner pos="tr">Sixth Street Burgers</Corner>
      <h2 className="display">
        <Line>MÍRALA</Line>
        <Line delay="0.08s">DE CERCA.</Line>
      </h2>
      <p className="mono macro__sub">Bordes crujientes. Queso fundido. Cero arrepentimiento.</p>
      <div className="bolt pop macro__bolt" data-reveal="1" aria-hidden="true" />
    </section>
  );
}
