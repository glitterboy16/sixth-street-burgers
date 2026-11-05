import Corner from "@/components/kit/Corner";
import Line from "@/components/kit/Line";
import Arrow from "@/components/kit/Arrow";
import { dict, type Lang } from "@/i18n";

export default function BigType({ lang }: { lang: Lang }) {
  const t = dict(lang);
  return (
    <section className="sec bigtype">
      <Corner pos="tr">{t.bigtype.corner}</Corner>
      <h2 className="display">
        <Line>{t.bigtype.lines[0]}</Line>
        <Line delay="0.1s">{t.bigtype.lines[1]}</Line>
      </h2>
      <div className="bigtype__sub">
        <Arrow width={96} height={64} color="#FF2E3B" style={{ transform: "scaleX(-1)" }} />
        <p className="mono">{t.bigtype.sub}</p>
      </div>
    </section>
  );
}
