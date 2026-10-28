import Corner from "@/components/kit/Corner";
import Marquee from "@/components/kit/Marquee";

const TEXT = "SIXTH STREET! SIXTH STREET! SIXTH STREET! ";

export default function Wordmark() {
  return (
    <section className="wordmark" aria-label="Sixth Street">
      <Corner pos="tl">12 — Sixth Street</Corner>
      <Corner pos="tr">Lanzarote</Corner>
      <Marquee className="wordmark__row wordmark__row--a" text={TEXT} speed="36s" />
      <div className="wordmark__mid">
      </div>
      <Marquee className="wordmark__row wordmark__row--b" text={TEXT} speed="36s" reverse />
    </section>
  );
}
