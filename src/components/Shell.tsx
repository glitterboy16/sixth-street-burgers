import type { ReactNode } from "react";
import type { Viewport } from "next";
import { fontClass } from "@/app/fonts";
import { dict, LANGS, STORAGE_KEY, type Lang } from "@/i18n";
import { LangProvider } from "@/i18n/LangContext";
import "@/app/globals.css";
import "@/app/sections.css";

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0B0A09" },
    { media: "(prefers-color-scheme: light)", color: "#F6F1E7" },
  ],
};

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

// Se ejecuta antes del primer pintado, en orden:
//  1. idioma: si el usuario eligió uno en esta web (localStorage) y no es el de la página, o si entra por la
//     raíz sin haber elegido y su navegador habla otro de los nuestros, se le lleva a esa versión (misma
//     ruta, misma ancla). Las URL con prefijo (/en/…) compartidas se respetan salvo elección guardada.
//  2. tema guardado (evita el parpadeo claro/oscuro).
//  3. marca .js e .is-booting: la cortina de carga solo existe con JavaScript, y por si el JS de la página no
//     llegara, se levanta sola a los 6 s.
const bootScript = `(function(){try{var d=document.documentElement,B=${JSON.stringify(BASE)},L=${JSON.stringify(LANGS)},K=${JSON.stringify(STORAGE_KEY)};var s=null;try{s=localStorage.getItem(K)}catch(e){}var p=location.pathname;if(B&&p.indexOf(B)===0)p=p.slice(B.length);if(!p)p="/";var m=/^\\/(en|de|fr|it)(?=\\/|$)/.exec(p);var rest=m?p.slice(m[0].length):p;if(!rest)rest="/";var want=null;if(s&&L.indexOf(s)>=0){want=s}else if(!s&&!m){var nl=navigator.languages||[navigator.language||""];for(var i=0;i<nl.length;i++){var c=String(nl[i]).slice(0,2).toLowerCase();if(L.indexOf(c)>=0){want=c;break}}}if(want&&want!==d.lang){location.replace(B+(want==="es"?"":"/"+want)+rest+location.search+location.hash);return}var t=null;try{t=localStorage.getItem("ssb-theme")}catch(e){}if(t==="light"||t==="dark"){d.dataset.theme=t}d.classList.add("js","is-booting");setTimeout(function(){d.classList.remove("is-booting");d.classList.add("is-ready")},6000)}catch(e){}})();`;

/** <html> + <body> comunes a los dos layouts raíz: fuentes, tema, idioma y su diccionario. */
export default function Shell({ lang, children }: { lang: Lang; children: ReactNode }) {
  return (
    <html lang={lang} data-theme="dark" suppressHydrationWarning className={fontClass}>
      {/* eslint-disable-next-line @next/next/no-head-element -- layout raíz: aquí <head> es el sitio correcto */}
      <head>
        <script dangerouslySetInnerHTML={{ __html: bootScript }} />
      </head>
      <body>
        <LangProvider lang={lang} t={dict(lang)}>
          {children}
        </LangProvider>
      </body>
    </html>
  );
}
