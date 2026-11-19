import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { setTestUser } from '../../test/fakeAuthService'
import { renderRoute } from '../../test/renderRoute'

describe('páginas públicas para Google Play', () => {
  it('la política de privacidad se lee sin sesión', () => {
    setTestUser(null)
    renderRoute('/privacidad')
    expect(
      screen.getByRole('heading', { name: 'Política de privacidad', level: 1 }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Ve los pasos para eliminar tu cuenta' }),
    ).toHaveAttribute('href', '/eliminar-cuenta')
  })

  it('los pasos para eliminar la cuenta se leen sin sesión e incluyen el correo', () => {
    setTestUser(null)
    renderRoute('/eliminar-cuenta')
    expect(
      screen.getByRole('heading', { name: 'Eliminar tu cuenta de ConstGua', level: 1 }),
    ).toBeInTheDocument()
    expect(
      within(screen.getByRole('main')).getByRole('link', { name: 'emazariegos98@gmail.com' }),
    ).toHaveAttribute('href', expect.stringContaining('mailto:emazariegos98@gmail.com?subject='))
  })

  it('el pie de página enlaza la política de privacidad', async () => {
    const user = userEvent.setup()
    const { router } = renderRoute('/')
    await user.click(screen.getByRole('link', { name: 'Privacidad' }))
    expect(router.state.location.pathname).toBe('/privacidad')
  })
})
