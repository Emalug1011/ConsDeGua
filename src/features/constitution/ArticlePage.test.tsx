import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderRoute } from '../../test/renderRoute'
import { getArticle, getRelated } from './catalog'

describe('ArticlePage', () => {
  it('muestra número, epígrafe y texto del catálogo con el aviso de revisión', () => {
    const article = getArticle('1')!
    renderRoute('/articulo/1')

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Artículo 1')
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(article.epigrafe!)
    expect(screen.getByText(article.texto)).toBeInTheDocument()
    expect(screen.getByText(/Texto en revisión/)).toBeInTheDocument()
  })

  it('marca el artículo 256 como derogado', () => {
    renderRoute('/articulo/256')
    expect(screen.getByText('Derogado')).toBeInTheDocument()
  })

  it('muestra una disposición transitoria sin epígrafe', () => {
    renderRoute('/articulo/T23')
    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading).toHaveTextContent('Disposición transitoria 23')
    expect(heading).toHaveTextContent('Sin epígrafe')
  })

  it('muestra las relaciones con la advertencia y su nivel de cotejo', () => {
    const withRelations = ['44', '175', '278'].find((id) => getRelated(id).articulos.length > 0)!
    renderRoute(`/articulo/${withRelations}`)

    expect(screen.getByRole('heading', { name: 'Artículos relacionados' })).toBeInTheDocument()
    expect(screen.getByText(/No es doctrina ni fuente oficial/)).toBeInTheDocument()
  })

  it('avisa cuando el artículo no existe', () => {
    renderRoute('/articulo/999')
    expect(screen.getByRole('heading', { name: 'No encontramos ese artículo' })).toBeInTheDocument()
  })
})
