import Image from "next/image";
import Corner from "@/components/kit/Corner";
import Line from "@/components/kit/Line";
import { dict, type Lang } from "@/i18n";

export default function Venue({ lang }: { lang: Lang }) {
  const t = dict(lang);
  return (
    <section id="local" className="sec sec--themed venue">
      <Corner pos="tr">{t.venue.corner}</Corner>
      <div className="venue__grid">
        <div className="venue__copy">
          <h2 className="display">
            <Line>{t.venue.lines[0]}</Line>
            <Line delay="0.08s">{t.venue.lines[1]}</Line>
            <Line delay="0.16s" className="accent-amber">
              {t.venue.lines[2]}
            </Line>
          </h2>
        </div>
        <div className="venue__art">
          <div className="venue__frame">
            <Image
              src="/images/local-interior.jpg"
              alt={t.venue.altInterior}
              width={1536}
              height={2048}
              sizes="(max-width: 640px) 90vw, 440px"
            />
            {/* segunda foto, pinchada encima como una polaroid: la mesa con amigos */}
            <div className="venue__extra" data-reveal="1">
              <Image src="/images/mesa-amigos.webp" alt={t.venue.altTable} width={1800} height={1018} sizes="(max-width: 640px) 50vw, 260px" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
