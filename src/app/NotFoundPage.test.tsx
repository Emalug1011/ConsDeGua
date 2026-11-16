import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderRoute } from '../test/renderRoute'

describe('rutas', () => {
  it('muestra la página no encontrada en una ruta desconocida', () => {
    renderRoute('/no-existe')
    expect(screen.getByRole('heading', { name: 'No encontramos esta página' })).toBeInTheDocument()
  })
})
