import Image from "next/image";
import Corner from "@/components/kit/Corner";
import Line from "@/components/kit/Line";

export default function Collage() {
  return (
    <section className="collage" aria-label="Buena comida, buena gente, buen lío">
      <div className="collage__photo">
        {/* la foto entera, con su proporción; el titular va encima en escritorio y debajo en móvil */}
        <div className="collage__frame">
          <Image
            src="/images/local-fachada.jpg"
            alt="Fachada de Sixth Street Burgers de noche, letras de bombillas"
            fill
            sizes="100vw"
            style={{ objectFit: "contain", objectPosition: "50% 50%" }}
          />
        </div>
        <Corner pos="tl">09 — Buen lío</Corner>
        <Corner pos="tr">Terraza y salón</Corner>
        <h2 className="display">
          <Line>BUENA COMIDA.</Line>
          <Line delay="0.15s">BUENA GENTE.</Line>
          <Line delay="0.3s" className="accent-cheese">
            BUEN LÍO.
          </Line>
        </h2>
      </div>
    </section>
  );
}
