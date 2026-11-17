// Zoom del hero sobre el encuadre "cover". Módulo normal (sin "use client") para que lo compartan Hero.tsx y la
// precarga del primer fotograma en Home.tsx, que tienen que elegir el mismo juego de fotogramas.
// Apaisado (ordenador): la hamburguesa empieza cerca (Z_CERRADA) y la cámara se acerca mientras se abre (Z_ABIERTA),
// sin perder el bar de fondo. Vertical (móvil): empieza un poco cerca y se aleja al abrirse. En los dos casos el zoom
// nunca deja que la hamburguesa se salga de la pantalla.
export const Z_CERRADA = 1.4;
export const Z_ABIERTA = 1.6;
export const Z_MOVIL = 1.06;
// Se usa el juego grande ("h") si el pequeño ("m") se vería ampliado más de esto con el zoom de partida
export const AMPLIACION_MAX = 1.15;
