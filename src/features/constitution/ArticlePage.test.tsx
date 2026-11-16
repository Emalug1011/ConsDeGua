import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { renderRoute } from '../../test/renderRoute'
import { track } from '../metrics/track'
import { getArticle, getRelated } from './catalog'

describe('ArticlePage', () => {
  it('registra article_open solo con el id del artículo', () => {
    renderRoute('/articulo/47')
    expect(track).toHaveBeenCalledWith('article_open', { article_id: '47' })
  })

  it('muestra número, epígrafe y texto del catálogo con su fuente', () => {
    const article = getArticle('1')!
    renderRoute('/articulo/1')

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Artículo 1')
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(article.epigrafe!)
    expect(screen.getByText(article.texto)).toBeInTheDocument()
    expect(screen.getByText(/Texto cotejado/)).toBeInTheDocument()
    expect(screen.queryByText(/Texto en revisión/)).not.toBeInTheDocument()
  })

  it('muestra cada párrafo del texto por separado', () => {
    const article = getArticle('18')!
    const paragraphs = article.texto.split('\n')
    renderRoute('/articulo/18')

    for (const paragraph of paragraphs) {
      expect(screen.getByText(paragraph)).toBeInTheDocument()
    }
  })

  it('marca el artículo 256 como derogado y sin epígrafe', () => {
    renderRoute('/articulo/256')
    expect(screen.getByText('Derogado')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Sin epígrafe')
  })

  it('muestra una disposición transitoria sin epígrafe', () => {
    renderRoute('/articulo/T23')
    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading).toHaveTextContent('Disposición transitoria 23')
    expect(heading).toHaveTextContent('Sin epígrafe')
  })

  it('muestra las relaciones con el aviso corto, sin la advertencia larga', () => {
    const withRelations = ['44', '175', '278'].find((id) => getRelated(id).articulos.length > 0)!
    renderRoute(`/articulo/${withRelations}`)

    expect(screen.getByRole('heading', { name: 'Artículos relacionados' })).toBeInTheDocument()
    expect(screen.getByText('Validar sugerencia')).toBeInTheDocument()
    expect(screen.queryByText(/No es doctrina ni fuente oficial/)).not.toBeInTheDocument()
  })

  it('avisa cuando el artículo no existe', () => {
    renderRoute('/articulo/999')
    expect(screen.getByRole('heading', { name: 'No encontramos ese artículo' })).toBeInTheDocument()
  })
})

describe('artículos relacionados en la vista de artículo', () => {
  it('abren un diálogo sin salir de la página', async () => {
    const user = userEvent.setup()
    const relation = getRelated('138').articulos[0]!
    const label = relation.articulo.transitorio
      ? `Disposición transitoria ${relation.articulo.id.slice(1)}`
      : `Artículo ${relation.articulo.id}`
    const { router } = renderRoute('/articulo/138')

    await user.click(screen.getByRole('button', { name: new RegExp(`^Ver ${label}(:|$)`) }))

    const dialog = screen.getByRole('dialog', { name: label })
    expect(dialog).toHaveAttribute('open')
    expect(within(dialog).getByText(relation.nota)).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/articulo/138')
    expect(
      screen.queryByRole('link', { name: new RegExp(`^${label}(:|$)`) }),
    ).not.toBeInTheDocument()
  })
})
