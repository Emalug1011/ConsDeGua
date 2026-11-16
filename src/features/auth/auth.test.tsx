import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { setTestUser } from '../../test/fakeAuthService'
import { renderRoute } from '../../test/renderRoute'
import { track } from '../metrics/track'
import { signInWithGoogle, signOutUser } from './service'

describe('inicio de sesión', () => {
  it('manda a /ingresar si no hay sesión', async () => {
    setTestUser(null)
    const { router } = renderRoute('/articulo/1')

    expect(await screen.findByRole('button', { name: 'Ingresar con Google' })).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/ingresar')
  })

  it('la pantalla de ingreso tiene un solo botón', async () => {
    setTestUser(null)
    renderRoute('/ingresar')

    await screen.findByRole('button', { name: 'Ingresar con Google' })
    expect(screen.getAllByRole('button')).toHaveLength(1)
  })

  it('al ingresar vuelve a la página pedida y registra el evento login', async () => {
    setTestUser(null)
    const user = userEvent.setup()
    const { router } = renderRoute('/articulo/1')

    await user.click(await screen.findByRole('button', { name: 'Ingresar con Google' }))

    expect(signInWithGoogle).toHaveBeenCalledOnce()
    await waitFor(() => expect(router.state.location.pathname).toBe('/articulo/1'))
    expect(track).toHaveBeenCalledWith('login', { method: 'google' })
  })

  it('muestra un error si no se pudo iniciar sesión', async () => {
    setTestUser(null)
    vi.mocked(signInWithGoogle).mockRejectedValueOnce(new Error('sin red'))
    const user = userEvent.setup()
    renderRoute('/ingresar')

    await user.click(await screen.findByRole('button', { name: 'Ingresar con Google' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('No se pudo iniciar sesión')
  })

  it('no registra login si la persona cierra la ventana de Google', async () => {
    setTestUser(null)
    vi.mocked(signInWithGoogle).mockResolvedValueOnce('cancelled')
    const user = userEvent.setup()
    renderRoute('/ingresar')

    await user.click(await screen.findByRole('button', { name: 'Ingresar con Google' }))

    expect(track).not.toHaveBeenCalledWith('login', expect.anything())
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('cerrar sesión regresa a /ingresar', async () => {
    const user = userEvent.setup()
    const { router } = renderRoute('/')

    await user.click(screen.getByRole('button', { name: 'Cerrar sesión' }))

    expect(signOutUser).toHaveBeenCalledOnce()
    await waitFor(() => expect(router.state.location.pathname).toBe('/ingresar'))
  })
})
