import favicon from '../../public/favicon.svg?raw'
import { describe, expect, it } from 'vitest'
import { FAVICON_VIEWBOX, FLAG_STRIPES, QUETZAL_SHAPES } from './brandMark'

describe('favicon', () => {
  it('usa el mismo dibujo que el logotipo', () => {
    expect(favicon).toContain(`viewBox="${FAVICON_VIEWBOX}"`)
    for (const stripe of FLAG_STRIPES) {
      expect(favicon).toContain(`<rect x="${stripe.x}" y="0" width="${stripe.width}" height="32"`)
    }
    for (const d of [...QUETZAL_SHAPES.tailFeathers, QUETZAL_SHAPES.crest, QUETZAL_SHAPES.beak]) {
      expect(favicon).toContain(`d="${d}"`)
    }
    for (const shape of [QUETZAL_SHAPES.body, QUETZAL_SHAPES.breast]) {
      expect(favicon).toContain(
        `cx="${shape.cx}" cy="${shape.cy}" rx="${shape.rx}" ry="${shape.ry}"`,
      )
    }
    for (const shape of [QUETZAL_SHAPES.head, QUETZAL_SHAPES.eye]) {
      expect(favicon).toContain(`cx="${shape.cx}" cy="${shape.cy}" r="${shape.r}"`)
    }
  })
})
