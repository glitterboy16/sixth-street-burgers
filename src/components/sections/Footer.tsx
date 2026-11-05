import Image from "next/image";
import { site } from "@/data/site";
import WelcomeBadge from "@/components/kit/WelcomeBadge";
import Checker from "@/components/kit/Checker";
import { dict, hoursLines, menuHref, type Lang } from "@/i18n";

const lines = (arr: string[]) =>
  arr.map((l, i) => (
    <span key={l}>
      {i > 0 && <br />}
      {l}
    </span>
  ));

export default function Footer({ lang }: { lang: Lang }) {
  const t = dict(lang);
  return (
    <footer className="footer">
      {/* foto real del neón sobre el ladrillo (Instagram del local): banda apaisada en escritorio, vertical en móvil */}
      <div className="footer__wall" aria-hidden="true">
        <Image src="/images/pared-neon-v2.webp" alt="" fill sizes="100vw" className="footer__wall-img footer__wall-img--wide" />
        <Image src="/images/pared-neon-v2-v.webp" alt="" fill sizes="100vw" className="footer__wall-img footer__wall-img--tall" />
      </div>
      <div className="footer__brand">
        <WelcomeBadge className="footer__badge" id="rombo-footer" reveal />
      </div>
      <div className="footer__grid mono">
        <div>
          <h3>{t.footer.address}</h3>
          <p>{lines(site.address)}</p>
        </div>
        <div>
          <h3>{t.footer.hours}</h3>
          <p>{lines(hoursLines(lang))}</p>
        </div>
        <div>
          <h3>{t.footer.menu}</h3>
          <a href={menuHref(lang)}>
            {t.footer.fullMenu} <span className="arr" aria-hidden="true">→</span>
          </a>
          <a href={site.instagram.url} target="_blank" rel="noopener">
            {site.instagram.handle} <span className="arr" aria-hidden="true">↗</span>
          </a>
        </div>
        <div>
          <h3>{t.footer.legal}</h3>
          <a href="#">{t.footer.legalNotice}</a>
          <a href="#">{t.footer.privacy}</a>
          <a href="#">{t.footer.cookies}</a>
        </div>
      </div>
      <div className="footer__bar mono">
        <span>© {site.year} Sixth Street Burgers</span>
        <span>{t.common.tagline}</span>
      </div>
      <Checker />
    </footer>
  );
}
