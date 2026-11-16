/**
 * Dibujo del logotipo de ConstGua: bandera de Guatemala en franjas (celeste,
 * blanco, celeste, sin escudo) con un quetzal simplificado en la franja blanca.
 * Coordenadas en un lienzo de 48 × 32. `AppLogo` y `public/favicon.svg` usan
 * estas mismas figuras; una prueba verifica que coincidan.
 */
export const BRAND_VIEWBOX = '0 0 48 32'
/** Recorte cuadrado para el favicon: la franja blanca completa y parte de las celestes. */
export const FAVICON_VIEWBOX = '8 0 32 32'

export const FLAG_STRIPES = [
  { x: 0, width: 16, color: 'flagBlue' },
  { x: 16, width: 16, color: 'flagWhite' },
  { x: 32, width: 16, color: 'flagBlue' },
] as const

export const QUETZAL_SHAPES = {
  tailFeathers: ['M25.2 17.5 C26 21.5 25.6 25 24.2 29', 'M26.4 17 C27.8 21 27.8 25 26.6 29'],
  crest: 'M21 7.2 Q22.5 5 25 6.5 Q23.6 6.6 23 7.6 Z',
  beak: 'M20.5 8.8 L19.2 9.5 L20.6 9.7 Z',
  body: { cx: 24.5, cy: 13.5, rx: 3.2, ry: 4.6 },
  head: { cx: 22.8, cy: 8.6, r: 2.4 },
  breast: { cx: 23.4, cy: 15.5, rx: 2.1, ry: 2.6 },
  eye: { cx: 22.2, cy: 8.2, r: 0.45 },
} as const
