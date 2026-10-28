import Image from "next/image";
import Corner from "@/components/kit/Corner";
import Line from "@/components/kit/Line";
import WelcomeBadge from "@/components/kit/WelcomeBadge";

const traits = [
  { color: "var(--red)", text: "Luz de neón" },
  { color: "var(--teal)", text: "Cuero y ladrillo" },
  { color: "var(--amber)", text: "Diner de noche" },
];

export default function Venue() {
  return (
    <section id="local" className="sec sec--themed venue">
      <Corner pos="tl">08 — El local</Corner>
      <Corner pos="tr">Puerto del Carmen</Corner>
      <div className="venue__grid">
        <div className="venue__copy">
          <h2 className="display">
            <Line>BUENA COMIDA</Line>
            <Line delay="0.08s">MERECE</Line>
            <Line delay="0.16s" className="accent-amber">
              BUEN SITIO.
            </Line>
          </h2>
          <ul className="venue__list mono">
            {traits.map((t) => (
              <li key={t.text}>
                <i style={{ background: t.color }} aria-hidden="true" />
                {t.text}
              </li>
            ))}
          </ul>
        </div>
        <div className="venue__art">
          <div className="venue__frame">
            <Image
              src="/images/local-interior.jpg"
              alt="Interior de Sixth Street Burgers: neón rojo sobre ladrillo y banco de cuero teal"
              width={1536}
              height={2048}
              sizes="(max-width: 640px) 90vw, 440px"
            />
            <WelcomeBadge className="venue__badge" id="rombo-venue" reveal />
            {/* segunda foto, pinchada encima como una polaroid: la mesa con amigos */}
            <div className="venue__extra" data-reveal="1">
              <Image
                src="/images/mesa-amigos.webp"
                alt="Mesa de madera con tres hamburguesas, patatas en cucurucho y manos de amigos cogiendo la suya"
                width={1800}
                height={1018}
                sizes="(max-width: 640px) 50vw, 260px"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
