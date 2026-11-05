import Corner from "@/components/kit/Corner";
import Marquee from "@/components/kit/Marquee";
import { dict, type Lang } from "@/i18n";

const TEXT = "SIXTH STREET! SIXTH STREET! SIXTH STREET! ";

export default function Wordmark({ lang }: { lang: Lang }) {
  const t = dict(lang);
  return (
    <section className="wordmark" aria-label={t.wordmark.aria}>
      <Corner pos="tr">{t.wordmark.corner}</Corner>
      <Marquee className="wordmark__row wordmark__row--a" text={TEXT} speed="36s" />
      <div className="wordmark__mid"></div>
      <Marquee className="wordmark__row wordmark__row--b" text={TEXT} speed="36s" reverse />
    </section>
  );
}
