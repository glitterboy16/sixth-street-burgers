import Image from "next/image";
import Corner from "@/components/kit/Corner";
import Line from "@/components/kit/Line";
import { dict, type Lang } from "@/i18n";

export default function Collage({ lang }: { lang: Lang }) {
  const t = dict(lang);
  return (
    <section className="collage" aria-label={t.collage.aria}>
      <div className="collage__photo">
        {/* la foto entera, con su proporción; el titular va encima en escritorio y debajo en móvil */}
        <div className="collage__frame">
          <Image src="/images/local-fachada.jpg" alt={t.collage.alt} fill sizes="100vw" style={{ objectFit: "contain", objectPosition: "50% 50%" }} />
        </div>
        <Corner pos="tr">{t.collage.corner}</Corner>
        <h2 className="display">
          <Line>{t.collage.lines[0]}</Line>
          <Line delay="0.15s">{t.collage.lines[1]}</Line>
          <Line delay="0.3s" className="accent-cheese">
            {t.collage.lines[2]}
          </Line>
        </h2>
      </div>
    </section>
  );
}
