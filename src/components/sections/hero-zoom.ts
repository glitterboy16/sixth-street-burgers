// Zoom del hero sobre el encuadre "cover".
// Apaisado (ordenador): la hamburguesa empieza cerca (Z_CERRADA) y la cámara se acerca mientras se abre (Z_ABIERTA),
// sin perder el bar de fondo. Vertical (móvil): empieza un poco cerca y se aleja al abrirse. En los dos casos el zoom
// nunca deja que la hamburguesa se salga de la pantalla (Hero.tsx lo limita con la altura real de la torre).
export const Z_CERRADA = 1.4;
export const Z_ABIERTA = 1.6;
export const Z_MOVIL = 1.06;
