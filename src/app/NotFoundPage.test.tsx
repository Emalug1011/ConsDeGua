import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderRoute } from '../test/renderRoute'

describe('rutas', () => {
  it('muestra la página no encontrada en una ruta desconocida', () => {
    renderRoute('/no-existe')
    expect(screen.getByRole('heading', { name: 'No encontramos esta página' })).toBeInTheDocument()
  })
})

describe('logotipo', () => {
  it('aparece junto al nombre en la barra superior, oculto para lectores de pantalla', () => {
    renderRoute('/')
    const home = screen.getByRole('link', { name: 'ConstGua' })
    const logo = home.querySelector('svg')
    expect(logo).not.toBeNull()
    expect(logo).toHaveAttribute('aria-hidden', 'true')
  })
})
