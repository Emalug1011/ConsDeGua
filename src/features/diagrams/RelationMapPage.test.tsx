import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { renderRoute } from '../../test/renderRoute'
import { getRelated, listArticles } from '../constitution/catalog'
import { articleLabel } from '../constitution/format'
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

  it('abre el artículo relacionado en un diálogo sin salir del mapa', async () => {
    const user = userEvent.setup()
    const relation = getRelated('138').articulos[0]!
    const neighbor = relation.articulo
    const { router } = renderRoute('/relaciones/138')

    const buttons = screen.getAllByRole('button', {
      name: new RegExp(`^Ver ${articleLabel(neighbor)}(:|$)`),
    })
    await user.click(buttons[buttons.length - 1]!)

    const dialog = screen.getByRole('dialog', { name: articleLabel(neighbor) })
    expect(dialog).toHaveAttribute('open')
    expect(router.state.location.pathname).toBe('/relaciones/138')
    expect(within(dialog).getByText(neighbor.texto.split('\n')[0]!)).toBeInTheDocument()
    expect(within(dialog).getByText(relation.nota)).toBeInTheDocument()
    expect(track).toHaveBeenCalledWith('article_open', { article_id: neighbor.id })

    await user.click(within(dialog).getByRole('button', { name: 'Cerrar' }))
    expect(dialog).not.toHaveAttribute('open')
    expect(router.state.location.pathname).toBe('/relaciones/138')
  })

  it('centra el mapa en el diálogo, sin cambiar de página, y permite volver', async () => {
    const user = userEvent.setup()
    const neighbor = getRelated('138').articulos[0]!.articulo
    const { router } = renderRoute('/relaciones/138')

    const buttons = screen.getAllByRole('button', {
      name: new RegExp(`^Ver ${articleLabel(neighbor)}(:|$)`),
    })
    await user.click(buttons[buttons.length - 1]!)
    await user.click(screen.getByRole('button', { name: 'Centrar el mapa aquí' }))

    const mapDialog = screen.getByRole('dialog', {
      name: `Mapa de relaciones de ${articleLabel(neighbor)}`,
    })
    expect(mapDialog).toHaveAttribute('open')
    expect(
      within(mapDialog).getByRole('region', {
        name: `Mapa de relaciones de ${articleLabel(neighbor)}`,
      }),
    ).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/relaciones/138')
    expect(track).toHaveBeenCalledWith('relation_map_open', { article_id: neighbor.id })

    await user.click(within(mapDialog).getByRole('button', { name: 'Volver' }))
    expect(screen.getByRole('dialog', { name: articleLabel(neighbor) })).toHaveAttribute('open')
  })

  it('desde el diálogo abre el artículo completo', async () => {
    const user = userEvent.setup()
    const neighbor = getRelated('138').articulos[0]!.articulo
    const { router } = renderRoute('/relaciones/138')

    const buttons = screen.getAllByRole('button', {
      name: new RegExp(`^Ver ${articleLabel(neighbor)}(:|$)`),
    })
    await user.click(buttons[buttons.length - 1]!)
    await user.click(screen.getByRole('button', { name: 'Abrir artículo' }))

    await waitFor(() => expect(router.state.location.pathname).toBe(`/articulo/${neighbor.id}`))
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

  it('desde la vista de artículo se abre en un diálogo, sin cambiar de página', async () => {
    const user = userEvent.setup()
    const { router } = renderRoute('/articulo/138')

    await user.click(screen.getByRole('button', { name: 'Ver mapa de relaciones' }))

    const dialog = screen.getByRole('dialog', { name: 'Mapa de relaciones de Artículo 138' })
    expect(dialog).toHaveAttribute('open')
    expect(router.state.location.pathname).toBe('/articulo/138')

    // Un artículo del mapa abre su vista previa dentro del mismo diálogo.
    const neighbor = getRelated('138').articulos[0]!.articulo
    const inMap = within(dialog).getAllByRole('button', {
      name: new RegExp(`^Ver ${articleLabel(neighbor)}(:|$)`),
    })
    await user.click(inMap[inMap.length - 1]!)
    expect(screen.getByRole('dialog', { name: articleLabel(neighbor) })).toHaveAttribute('open')
    expect(router.state.location.pathname).toBe('/articulo/138')
  })
})
