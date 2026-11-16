import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { renderRoute } from '../../test/renderRoute'
import { getRelated, listArticles } from '../constitution/catalog'
import { track } from '../metrics/track'

describe('RelationMapPage', () => {
  it('muestra el artículo, el aviso corto, el mapa y la lista de relaciones', () => {
    const total = getRelated('138').articulos.length
    renderRoute('/relaciones/138')

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Artículo 138')
    expect(screen.getByText('Validar sugerencia')).toBeInTheDocument()
    expect(screen.queryByText(/No es doctrina ni fuente oficial/)).not.toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'Mapa de relaciones de Artículo 138' })).toBeVisible()
    expect(screen.getByRole('heading', { name: `${total} relaciones` })).toBeInTheDocument()
    expect(track).toHaveBeenCalledWith('relation_map_open', { article_id: '138' })
  })

  it('filtra la lista al desactivar un tipo', async () => {
    const user = userEvent.setup()
    const related = getRelated('138').articulos
    const tematicas = related.filter((r) => r.tipo === 'tematica').length
    renderRoute('/relaciones/138')

    await user.click(screen.getByRole('button', { name: 'Temática' }))

    expect(screen.getByRole('button', { name: 'Temática' })).toHaveAttribute(
      'aria-pressed',
      'false',
    )
    const remaining = related.length - tematicas
    expect(
      screen.getByRole('heading', {
        name: remaining === 1 ? '1 relación' : `${remaining} relaciones`,
      }),
    ).toBeInTheDocument()
  })

  it('avisa cuando los filtros no dejan ninguna relación', async () => {
    const user = userEvent.setup()
    renderRoute('/relaciones/138')

    for (const name of ['Cita textual', 'Texto leído', 'Pendiente']) {
      await user.click(screen.getByRole('button', { name }))
    }

    expect(screen.getByText(/Ninguna relación coincide con los filtros/)).toBeInTheDocument()
    expect(screen.queryByRole('region', { name: /Mapa de relaciones/ })).not.toBeInTheDocument()
  })

  it('centra el mapa en otro artículo desde la lista', async () => {
    const user = userEvent.setup()
    const neighbor = getRelated('138').articulos[0]!.articulo
    const { router } = renderRoute('/relaciones/138')

    const links = screen.getAllByRole('link', {
      name: new RegExp(
        `^${neighbor.transitorio ? 'Disposición transitoria' : 'Artículo'} ${neighbor.id.replace('T', '')}\\b`,
      ),
    })
    await user.click(links[links.length - 1]!)

    await waitFor(() => expect(router.state.location.pathname).toBe(`/relaciones/${neighbor.id}`))
  })

  it('avisa si el artículo no tiene relaciones', () => {
    const lonely = listArticles().find((a) => {
      const r = getRelated(a.id)
      return r.articulos.length === 0 && r.bloques.length === 0
    })!
    renderRoute(`/relaciones/${lonely.id}`)
    expect(
      screen.getByText('Este artículo no tiene relaciones en el análisis.'),
    ).toBeInTheDocument()
  })

  it('se abre desde la vista de artículo', async () => {
    const user = userEvent.setup()
    const { router } = renderRoute('/articulo/138')

    await user.click(screen.getByRole('button', { name: 'Ver mapa de relaciones' }))

    await waitFor(() => expect(router.state.location.pathname).toBe('/relaciones/138'))
  })
})
