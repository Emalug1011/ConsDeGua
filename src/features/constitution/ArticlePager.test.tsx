import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { renderRoute } from '../../test/renderRoute'
import { getAdjacent } from './catalog'

describe('getAdjacent', () => {
  it('sigue el orden del catálogo, de 281 pasa a T1', () => {
    expect(getAdjacent('1').anterior).toBeUndefined()
    expect(getAdjacent('1').siguiente?.id).toBe('2')
    expect(getAdjacent('281').siguiente?.id).toBe('T1')
    expect(getAdjacent('T1').anterior?.id).toBe('281')
    expect(getAdjacent('T27').siguiente).toBeUndefined()
    expect(getAdjacent('999')).toEqual({})
  })
})

describe('ArticlePager', () => {
  it('lleva al artículo siguiente y al anterior', async () => {
    const user = userEvent.setup()
    const { router } = renderRoute('/articulo/47')

    await user.click(screen.getByRole('link', { name: 'Artículo siguiente: Artículo 48' }))
    await waitFor(() => expect(router.state.location.pathname).toBe('/articulo/48'))

    await user.click(screen.getByRole('link', { name: 'Artículo anterior: Artículo 47' }))
    await waitFor(() => expect(router.state.location.pathname).toBe('/articulo/47'))
  })

  it('no ofrece anterior en el artículo 1 ni siguiente en la última transitoria', () => {
    const { unmount } = renderRoute('/articulo/1')
    expect(screen.queryByRole('link', { name: /^Artículo anterior/ })).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: /^Artículo siguiente/ })).toBeInTheDocument()
    unmount()

    renderRoute('/articulo/T27')
    expect(screen.queryByRole('link', { name: /^Artículo siguiente/ })).not.toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Artículo anterior: Disposición transitoria 26' }),
    ).toBeInTheDocument()
  })
})
