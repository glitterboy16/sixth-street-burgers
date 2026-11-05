"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { Map as MapboxMap } from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { site } from "@/data/site";
import { onThemeChange, prefersReducedMotion } from "@/lib/motion";
import Corner from "@/components/kit/Corner";
import TodayHours from "@/components/kit/TodayHours";

// Mapa de Mapbox justo antes del pie: parte del estilo dark-v11 / light-v11 y, en cuanto carga, repinta cada
// capa (fondo, suelo, agua, edificios, calles, rótulos) con la paleta de la web del tema activo. Se descarga
// solo cuando la sección se acerca al viewport (mapbox-gl pesa ~450 KB gz). El pin y el botón abren Apple
// Maps en iPhone/iPad/Mac y Google Maps en el resto. Sin token (MAPBOX_TOKEN) o si el estilo no carga, queda
// la tarjeta con la dirección sobre un panel liso: la sección nunca se ve rota.

const TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? "";
const { lng, lat } = site.geo;
const GOOGLE = `https://www.google.com/maps/search/?api=1&query=${lat}%2C${lng}`;
const APPLE = `https://maps.apple.com/?ll=${lat},${lng}&q=${encodeURIComponent(site.name)}&z=16`;
const isApple = () => /iPhone|iPad|iPod|Macintosh/.test(navigator.userAgent);
const mapsHref = () => (isApple() ? APPLE : GOOGLE);
const noop = () => () => {};

type Theme = "dark" | "light";
const theme = (): Theme => (document.documentElement.dataset.theme === "light" ? "light" : "dark");
const STYLE: Record<Theme, string> = {
  dark: "mapbox://styles/mapbox/dark-v11",
  light: "mapbox://styles/mapbox/light-v11",
};

// Paleta del mapa por tema: los tokens de globals.css llevados a suelo, agua, calles y rótulos.
const PAL = {
  dark: {
    bg: "#0b0a09",
    land: "#0f0d0b",
    use: "#141210",
    park: "#101814",
    water: "#0d2327",
    building: "#171411",
    buildingLine: "#231d18",
    roadCase: "#0b0a09",
    roadMinor: "#1f1a16",
    road: "#2a2420",
    roadMajor: "#3b322a",
    motorway: "#4f3e2b",
    rail: "#1a1613",
    text: "#a8a097",
    roadText: "#8b8378",
    place: "#faf6ef",
    halo: "#0b0a09",
  },
  light: {
    bg: "#f6f1e7",
    land: "#f2ecdf",
    use: "#ece5d6",
    park: "#e3e8d2",
    water: "#c6dcdb",
    building: "#e8e0cf",
    buildingLine: "#d6ccb9",
    roadCase: "#d8cfbe",
    roadMinor: "#fbf8f1",
    road: "#fffdf8",
    roadMajor: "#ffffff",
    motorway: "#ffd56a",
    rail: "#d8cfbe",
    text: "#605850",
    roadText: "#7a7166",
    place: "#0b0b0d",
    halo: "#f6f1e7",
  },
};

const HIDE =
  /^(admin|hillshade|contour|transit|poi-label|airport|natural-|water-.*label|waterway-label|golf|path-pedestrian-label|ferry|aeroway|road-.*shield|road-exit)/;

function paint(map: MapboxMap, t: Theme) {
  const p = PAL[t];
  const layers = map.getStyle()?.layers ?? [];
  // las capas se recorren por tipo, así que la propiedad no es un literal conocido para los tipos de mapbox
  const m = map as unknown as { setPaintProperty(id: string, name: string, value: unknown): void };
  const set = (id: string, prop: string, v: unknown) => {
    try {
      m.setPaintProperty(id, prop, v);
    } catch {}
  };
  const hide = (id: string) => {
    try {
      map.setLayoutProperty(id, "visibility", "none");
    } catch {}
  };
  for (const l of layers) {
    const id = l.id;
    if (l.type === "background") {
      set(id, "background-color", p.bg);
      continue;
    }
    if (HIDE.test(id)) {
      hide(id);
      continue;
    }
    if (l.type === "fill") {
      const c = /water/.test(id)
        ? p.water
        : /park|pitch|scrub|wood|grass|cemetery|national|green/.test(id)
          ? p.park
          : /building/.test(id)
            ? p.building
            : /landuse|land-structure/.test(id)
              ? p.use
              : p.land;
      set(id, "fill-color", c);
      set(id, "fill-opacity", 1);
      set(id, "fill-outline-color", /building/.test(id) ? p.buildingLine : c);
      continue;
    }
    if (l.type === "fill-extrusion") {
      set(id, "fill-extrusion-color", p.building);
      continue;
    }
    if (l.type === "line") {
      const c = /water/.test(id)
        ? p.water
        : /building/.test(id)
          ? p.buildingLine
          : /-case|outline/.test(id)
            ? p.roadCase
            : /motorway|trunk/.test(id)
              ? p.motorway
              : /primary|secondary|tertiary|major/.test(id)
                ? p.roadMajor
                : /rail/.test(id)
                  ? p.rail
                  : /street|minor|service|link|path|pedestrian|steps|track|construction|polygon/.test(id)
                    ? p.roadMinor
                    : p.road;
      set(id, "line-color", c);
      continue;
    }
    if (l.type === "symbol") {
      const place = /settlement|place|state|country|continent/.test(id);
      set(id, "text-color", place ? p.place : /road/.test(id) ? p.roadText : p.text);
      set(id, "text-halo-color", p.halo);
      set(id, "text-halo-width", 1.2);
      set(id, "icon-opacity", 0);
      continue;
    }
    if (l.type === "circle") hide(id);
  }
}

const PIN_SVG =
  '<svg viewBox="0 0 48 60" width="48" height="60" aria-hidden="true" focusable="false">' +
  '<path d="M24 2C11.8 2 2 11.6 2 23.5 2 39 24 58 24 58s22-19 22-34.5C46 11.6 36.2 2 24 2z" fill="#ff2e3b" stroke="#0b0a09" stroke-width="2"/>' +
  '<circle cx="24" cy="23" r="8" fill="#fff1bf"/></svg>';
const PIN_HTML = '<span class="mapsec__pin-body"><span class="mapsec__pulse"></span>' + PIN_SVG + "</span>";

export default function MapSection() {
  const box = useRef<HTMLElement>(null);
  const host = useRef<HTMLDivElement>(null);
  // en servidor y antes de hidratar, Google Maps; en el cliente, Apple Maps si es iPhone/iPad/Mac
  const href = useSyncExternalStore(noop, mapsHref, () => GOOGLE);
  const [state, setState] = useState<"idle" | "ready" | "static">(TOKEN ? "idle" : "static");

  useEffect(() => {
    const url = mapsHref();
    const sec = box.current,
      el = host.current;
    if (!sec || !el || !TOKEN) return;
    let map: MapboxMap | null = null;
    let off = () => {};
    let disposed = false;

    const io = new IntersectionObserver(
      async (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        io.disconnect();
        const mapboxgl = (await import("mapbox-gl")).default;
        if (disposed) return;
        mapboxgl.accessToken = TOKEN;
        const rm = prefersReducedMotion();
        map = new mapboxgl.Map({
          container: el,
          style: STYLE[theme()],
          center: [lng, lat],
          zoom: rm ? 15.3 : 13.4,
          pitch: 42,
          bearing: -14,
          scrollZoom: false,
          dragRotate: false,
          touchPitch: false,
          cooperativeGestures: true,
          attributionControl: false,
          logoPosition: "bottom-right",
          language: "es",
          locale: {
            "ScrollZoomBlocker.CtrlMessage": "Usa Ctrl + rueda para hacer zoom",
            "ScrollZoomBlocker.CmdMessage": "Usa ⌘ + rueda para hacer zoom",
            "TouchPanBlocker.Message": "Usa dos dedos para mover el mapa",
            "NavigationControl.ZoomIn": "Acercar",
            "NavigationControl.ZoomOut": "Alejar",
            "AttributionControl.ToggleAttribution": "Atribución",
          },
        });
        map.addControl(new mapboxgl.AttributionControl({ compact: true }), "bottom-right");
        map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "top-right");
        map.on("style.load", () => {
          if (map) paint(map, theme());
        });
        map.once("load", () => {
          setState("ready");
          // entra desde lejos y se posa sobre el local (solo si el usuario no pide menos movimiento)
          if (!rm) map?.easeTo({ zoom: 15.3, duration: 2400, easing: (t) => 1 - Math.pow(1 - t, 3) });
        });
        map.on("error", (e) => {
          const status = (e.error as { status?: number } | undefined)?.status;
          if (status === 401 || status === 403) setState("static");
        });

        const pin = document.createElement("a");
        pin.className = "mapsec__pin";
        pin.href = url;
        pin.target = "_blank";
        pin.rel = "noopener";
        pin.setAttribute("aria-label", `Abrir ${site.name} en Maps`);
        pin.innerHTML = PIN_HTML;
        new mapboxgl.Marker({ element: pin, anchor: "bottom" }).setLngLat([lng, lat]).addTo(map);

        off = onThemeChange(() => map?.setStyle(STYLE[theme()]));
        // solo en desarrollo: el mapa a mano en la consola para inspeccionar capas
        if (process.env.NODE_ENV !== "production") (window as unknown as { __ssbMap?: MapboxMap }).__ssbMap = map;
      },
      { rootMargin: "600px 0px" },
    );
    io.observe(sec);
    return () => {
      disposed = true;
      io.disconnect();
      off();
      map?.remove();
    };
  }, []);

  return (
    <section id="donde" ref={box} className={`sec sec--themed mapsec is-${state}`} aria-labelledby="donde-title">
      <Corner pos="tr">28.92°N · 13.66°O</Corner>
      <div ref={host} className="mapsec__map" role="region" aria-label="Mapa con la ubicación de Sixth Street Burgers" />
      {state === "static" && (
        <a
          href={href}
          target="_blank"
          rel="noopener"
          className="mapsec__pin mapsec__pin--static"
          aria-label={`Abrir ${site.name} en Maps`}
          dangerouslySetInnerHTML={{ __html: PIN_HTML }}
        />
      )}
      <div className="mapsec__card" data-reveal="1">
        <p className="mono mapsec__kicker">Estamos aquí</p>
        <h2 id="donde-title" className="display mapsec__title">
          VEN A
          <br />
          VERNOS.
        </h2>
        <address className="mono mapsec__addr">{site.address.join(" · ")}</address>
        <p className="mono mapsec__hours">
          <TodayHours />
        </p>
        <a href={href} target="_blank" rel="noopener" className="btn btn--primary">
          Abrir en Maps <span className="arr" aria-hidden="true">↗</span>
        </a>
      </div>
    </section>
  );
}
