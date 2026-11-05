import Image from "next/image";
import Corner from "@/components/kit/Corner";
import Line from "@/components/kit/Line";
import ImageSlot from "@/components/kit/ImageSlot";
import { dict, type Lang } from "@/i18n";

export default function Manifesto({ lang }: { lang: Lang }) {
  const t = dict(lang);
  return (
    <section className="sec manifesto">
      <Corner pos="tr">{t.common.tagline}</Corner>
      <div className="manifesto__grid">
        <div className="manifesto__card">
          <h3 className="display">
            <Line>{t.manifesto.card[0]}</Line>
            <Line delay="0.08s">{t.manifesto.card[1]}</Line>
          </h3>
          <div className="manifesto__square">
            <div className="manifesto__photo">
              <ImageSlot id="manifiesto-burger" alt={t.alts["manifiesto-burger"]} shape="circle" sizes="320px" />
            </div>
          </div>
          <div className="sparkle" aria-hidden="true" />
        </div>
        <div className="manifesto__copy">
          <h2 className="display">
            <Line>{t.manifesto.lines[0]}</Line>
            <Line delay="0.08s">{t.manifesto.lines[1]}</Line>
          </h2>
          <div className="manifesto__row">
            <p className="mono">{t.manifesto.sub}</p>
            <figure className="manifesto__open" data-reveal="1">
              <Image src="/images/pared-open.webp" alt={t.manifesto.altOpen} width={1200} height={1500} sizes="(max-width: 640px) 56vw, 280px" />
            </figure>
          </div>
        </div>
      </div>
    </section>
  );
}
