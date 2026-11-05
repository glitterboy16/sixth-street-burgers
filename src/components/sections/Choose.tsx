import Corner from "@/components/kit/Corner";
import Line from "@/components/kit/Line";
import Arrow from "@/components/kit/Arrow";
import WelcomeBadge from "@/components/kit/WelcomeBadge";
import { dict, type Lang } from "@/i18n";

/** El rombo del cartel a pantalla completa, con el eslogan de bienvenida y una flecha que lo señala. */
export default function Choose({ lang }: { lang: Lang }) {
  const t = dict(lang);
  return (
    <section id="carta" className="sec choose">
      <Corner pos="tr">{t.choose.corner}</Corner>
      <div className="choose__stage">
        <h2 className="display choose__title">
          <Line>{t.choose.lines[0]}</Line>
          <Line delay="0.08s" className="accent-cheese">
            {t.choose.lines[1]}
          </Line>
        </h2>
        <WelcomeBadge className="choose__badge" id="rombo-choose" reveal />
        <Arrow big width={170} height={96} color="currentColor" className="choose__arrow choose__arrow--big" reveal />
      </div>
      <Corner pos="bl">{t.choose.cornerBl}</Corner>
    </section>
  );
}
