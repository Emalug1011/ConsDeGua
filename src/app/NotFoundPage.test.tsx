import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { setTestUser } from '../test/fakeAuthService'
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

describe('pie de página', () => {
  it('muestra los datos del desarrollador en las páginas con sesión', () => {
    renderRoute('/articulo/1')
    const footer = screen.getByRole('contentinfo')
    expect(footer).toHaveTextContent('Un proyecto de EmaLUG Labs')
    expect(screen.getByRole('link', { name: 'emazariegos98@gmail.com' })).toHaveAttribute(
      'href',
      'mailto:emazariegos98@gmail.com',
    )
  })

  it('también aparece en la pantalla de ingreso', async () => {
    setTestUser(null)
    renderRoute('/ingresar')
    await screen.findByRole('button', { name: 'Ingresar con Google' })
    expect(screen.getByRole('contentinfo')).toHaveTextContent('Un proyecto de EmaLUG Labs')
  })
})
