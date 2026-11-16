import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { renderRoute } from '../../test/renderRoute'
import { getArticle, getStructure } from './catalog'

describe('CatalogPage', () => {
  it('muestra el índice por títulos', () => {
    renderRoute('/')
    expect(
      screen.getByRole('navigation', { name: 'Índice de la Constitución' }),
    ).toBeInTheDocument()
    for (const title of getStructure()) {
      expect(screen.getByText(title.nombre, { selector: 'summary span' })).toBeInTheDocument()
    }
  })

  it('busca por número y enlaza al artículo', async () => {
    const user = userEvent.setup()
    renderRoute('/')

    await user.type(screen.getByRole('searchbox', { name: 'Buscar artículo' }), '47')

    const article = getArticle('47')!
    const link = screen.getAllByRole('link', { name: `Artículo 47: ${article.epigrafe}` })[0]
    expect(link).toHaveAttribute('href', '/articulo/47')
  })

  it('avisa cuando no hay resultados', async () => {
    const user = userEvent.setup()
    renderRoute('/')

    await user.type(screen.getByRole('searchbox', { name: 'Buscar artículo' }), 'zzxxqq')

    expect(screen.getByRole('heading', { name: 'Sin resultados' })).toBeInTheDocument()
  })
})
