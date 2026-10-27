import Marquee from "@/components/kit/Marquee";
import { tickerWords } from "@/data/site";

const fwd = tickerWords.map((w) => `${w} ★ `).join("").repeat(2);
const rev = [...tickerWords].reverse().map((w) => `${w} ★ `).join("").repeat(2);

export default function Ticker() {
  return (
    <section className="ticker" aria-label={tickerWords.join(", ").toLowerCase()}>
      <div className="ticker__bar ticker__bar--a" aria-hidden="true">
        <Marquee text={fwd} speed="40s" />
      </div>
      <div className="ticker__bar ticker__bar--b" aria-hidden="true">
        <Marquee text={rev} speed="46s" reverse />
      </div>
    </section>
  );
}
