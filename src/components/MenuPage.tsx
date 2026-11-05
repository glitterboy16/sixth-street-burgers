import type { CSSProperties } from "react";
import Nav from "@/components/sections/Nav";
import Footer from "@/components/sections/Footer";
import Reveals from "@/components/Reveals";
import Boot from "@/components/Boot";
import Corner from "@/components/kit/Corner";
import Line from "@/components/kit/Line";
import Checker from "@/components/kit/Checker";
import TodayHours from "@/components/kit/TodayHours";
import { carta, L } from "@/data/carta";
import { site } from "@/data/site";
import { dict, homeHref, hoursLines, type Lang } from "@/i18n";

/**
 * Página /carta/: la carta completa por apartados. La portada no cambia (sigue con sus tres hamburguesas);
 * aquí va todo lo demás, con el mismo lenguaje visual: Anton a lo grande, mono para precios, paneles de color.
 */
// "12,90 €" → "12.90" para los datos estructurados
const priceNumber = (p: string) => p.replace(/[^\d,]/g, "").replace(",", ".");

export default function MenuPage({ lang }: { lang: Lang }) {
  const t = dict(lang);
  const tel = site.phone.replace(/\s/g, "");
  // datos estructurados de la carta (Google puede mostrar platos y precios)
  const ld = {
    "@context": "https://schema.org",
    "@type": "Menu",
    name: t.menu.title.join(" "),
    inLanguage: lang,
    hasMenuSection: carta.map((c) => ({
      "@type": "MenuSection",
      name: L(c.titulo, lang),
      hasMenuItem: c.platos.map((p) => ({
        "@type": "MenuItem",
        name: L(p.nombre, lang),
        ...(p.desc ? { description: L(p.desc, lang) } : {}),
        offers: { "@type": "Offer", price: priceNumber(p.precio), priceCurrency: "EUR" },
      })),
    })),
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <a href="#contenido" className="skip">
        {t.common.skip}
      </a>
      <Boot />
      <Nav page="/carta/" />
      <main id="contenido" tabIndex={-1} className="menu">
        <section className="sec sec--themed menu__hero" aria-labelledby="carta-title">
          <Corner pos="tr">{t.menu.corner}</Corner>
          <Corner pos="bl">
            <TodayHours />
          </Corner>
          <p className="mono menu__kicker">{t.menu.kicker}</p>
          <h1 id="carta-title" className="display menu__title">
            <Line>{t.menu.title[0]}</Line>
            <Line delay="0.08s" className="accent-red">
              {t.menu.title[1]}
            </Line>
          </h1>
          <div className="menu__hero-row">
            <p className="lead menu__intro">{t.menu.intro}</p>
            <nav className="menu__index mono" aria-label={t.menu.index}>
              {carta.map((c) => (
                <a key={c.id} href={`#${c.id}`}>
                  {L(c.titulo, lang)}
                </a>
              ))}
            </nav>
          </div>
        </section>
        <Checker />

        {carta.map((c, ci) => (
          <section key={c.id} id={c.id} className={`sec menu-cat menu-cat--${c.tone}`} aria-labelledby={`cat-${c.id}`}>
            {ci === 0 && <div className="sparkle menu-cat__sparkle" aria-hidden="true" />}
            <div className="menu-cat__grid">
              <header className="menu-cat__head">
                <h2 id={`cat-${c.id}`} className="display">
                  <Line>{L(c.titulo, lang)}</Line>
                </h2>
                {c.nota && <p className="menu-cat__note">{L(c.nota, lang)}</p>}
              </header>
              <ul className="menu-list">
                {c.platos.map((p, i) => (
                  <li
                    key={p.nombre.es}
                    className="menu-item"
                    data-reveal="1"
                    style={{ "--delay": `${Math.min(i, 8) * 0.05}s` } as CSSProperties}
                  >
                    <div className="menu-item__row">
                      <span className="menu-item__name">{L(p.nombre, lang)}</span>
                      <span className="menu-item__dots" aria-hidden="true" />
                      <span className="menu-item__price">{p.precio}</span>
                    </div>
                    {p.desc && <p className="menu-item__desc">{L(p.desc, lang)}</p>}
                  </li>
                ))}
              </ul>
            </div>
          </section>
        ))}

        <section className="sec sec--themed menu__close">
          <Corner pos="tr">{t.menu.closingSub}</Corner>
          <h2 className="display">
            <Line>{t.menu.closingLines[0]}</Line>
            <Line delay="0.08s" className="accent-cheese">
              {t.menu.closingLines[1]}
            </Line>
          </h2>
          <div className="menu__close-row">
            <address className="mono menu__close-info">
              {hoursLines(lang).map((h) => (
                <span key={h}>{h}</span>
              ))}
              <span>{site.address.join(" · ")}</span>
              <a href={`tel:${tel}`}>{site.phone}</a>
            </address>
            <div className="menu__close-actions">
              <p className="lead">{t.menu.orderNote}</p>
              <div className="menu__close-btns">
                <a href={homeHref(lang, "#donde")} className="btn btn--primary">
                  {t.menu.directions}
                </a>
                <a href={homeHref(lang)} className="btn btn--outline">
                  {t.menu.backHome}
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer lang={lang} />
      <Reveals />
    </>
  );
}
