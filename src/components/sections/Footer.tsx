import Image from "next/image";
import { site } from "@/data/site";
import WelcomeBadge from "@/components/kit/WelcomeBadge";
import Checker from "@/components/kit/Checker";

const lines = (arr: string[]) =>
  arr.map((l, i) => (
    <span key={l}>
      {i > 0 && <br />}
      {l}
    </span>
  ));

export default function Footer() {
  return (
    <footer className="footer">
      {/* foto real del neón sobre el ladrillo (Instagram del local): banda apaisada en escritorio, vertical en móvil */}
      <div className="footer__wall" aria-hidden="true">
        <Image src="/images/pared-neon-v2.webp" alt="" fill sizes="100vw" className="footer__wall-img footer__wall-img--wide" />
        <Image src="/images/pared-neon-v2-v.webp" alt="" fill sizes="100vw" className="footer__wall-img footer__wall-img--tall" />
      </div>
      <div className="footer__brand">
        <WelcomeBadge className="footer__badge" id="rombo-footer" reveal />
        <p className="footer__wordmark">
          SIXTH STREET
          <br />
          BURGERS
        </p>
      </div>
      <div className="footer__grid mono">
        <div>
          <h4>Dirección</h4>
          <p>{lines(site.address)}</p>
        </div>
        <div>
          <h4>Horario</h4>
          <p>{lines(site.hours)}</p>
        </div>
        <div>
          <h4>Instagram</h4>
          <a href={site.instagram.url} target="_blank" rel="noopener">
            {site.instagram.handle} <span className="arr" aria-hidden="true">↗</span>
          </a>
        </div>
        <div>
          <h4>Legal</h4>
          <a href="#">Aviso legal</a>
          <a href="#">Privacidad</a>
          <a href="#">Cookies</a>
        </div>
      </div>
      <div className="footer__bar mono">
        <span>© {site.year} Sixth Street Burgers</span>
        <span>{site.tagline}</span>
      </div>
      <Checker />
    </footer>
  );
}
