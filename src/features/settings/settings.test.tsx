import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import {
  TEST_USER,
  deleteAccount,
  leaveAfterAccountDeletion,
  setTestUser,
} from '../../test/fakeAuthService'
import { resetSettings } from '../../test/fakeSettingsService'
import { renderRoute } from '../../test/renderRoute'
import { getArticle } from '../constitution/catalog'
import { saveLastArticle, setRememberReading } from './service'

describe('menú de la cuenta', () => {
  it('muestra la foto de la persona y abre el menú con apuntes, ajustes y salir', async () => {
    const user = userEvent.setup()
    setTestUser({ ...TEST_USER, photoURL: 'https://example.com/foto.png' })
    renderRoute('/')

    const button = screen.getByRole('button', { name: 'Abrir menú de tu cuenta' })
    expect(button.querySelector('img')).toHaveAttribute('src', 'https://example.com/foto.png')
    expect(button).toHaveAttribute('aria-expanded', 'false')

    await user.click(button)
    expect(button).toHaveAttribute('aria-expanded', 'true')
    const menu = screen.getByRole('navigation', { name: 'Tu cuenta' })
    expect(within(menu).getByRole('link', { name: 'Mis apuntes' })).toHaveAttribute(
      'href',
      '/apuntes',
    )
    expect(within(menu).getByRole('link', { name: 'Ajustes' })).toHaveAttribute('href', '/ajustes')
    expect(within(menu).getByRole('button', { name: 'Cerrar sesión' })).toBeInTheDocument()
    expect(screen.getByText(TEST_USER.displayName!)).toBeInTheDocument()

    await user.keyboard('{Escape}')
    expect(screen.queryByRole('navigation', { name: 'Tu cuenta' })).not.toBeInTheDocument()
  })

  it('sin foto muestra la inicial del nombre', () => {
    renderRoute('/')
    const button = screen.getByRole('button', { name: 'Abrir menú de tu cuenta' })
    expect(button.querySelector('img')).toBeNull()
    expect(button).toHaveTextContent('P')
  })

  it('lleva a Ajustes y cierra el menú', async () => {
    const user = userEvent.setup()
    const { router } = renderRoute('/')
    await user.click(screen.getByRole('button', { name: 'Abrir menú de tu cuenta' }))
    await user.click(screen.getByRole('link', { name: 'Ajustes' }))

    await waitFor(() => expect(router.state.location.pathname).toBe('/ajustes'))
    expect(screen.getByRole('heading', { name: 'Ajustes', level: 1 })).toBeInTheDocument()
    expect(screen.queryByRole('navigation', { name: 'Tu cuenta' })).not.toBeInTheDocument()
  })
})

describe('ajustes', () => {
  it('activa y desactiva recordar dónde me quedé leyendo', async () => {
    const user = userEvent.setup()
    renderRoute('/ajustes')
    const toggle = screen.getByRole('switch', { name: 'Recordar dónde me quedé leyendo' })
    expect(toggle).toHaveAttribute('aria-checked', 'false')

    await user.click(toggle)
    expect(setRememberReading).toHaveBeenLastCalledWith(TEST_USER.uid, true)
    await waitFor(() => expect(toggle).toHaveAttribute('aria-checked', 'true'))

    await user.click(toggle)
    expect(setRememberReading).toHaveBeenLastCalledWith(TEST_USER.uid, false)
    await waitFor(() => expect(toggle).toHaveAttribute('aria-checked', 'false'))
  })

  it('cambia el tema y lo recuerda', async () => {
    const user = userEvent.setup()
    renderRoute('/ajustes')

    await user.click(screen.getByRole('radio', { name: 'Oscuro' }))
    expect(document.documentElement.dataset.theme).toBe('dark')
    expect(localStorage.getItem('constgua:tema')).toBe('dark')

    await user.click(screen.getByRole('radio', { name: 'Usar el del sistema' }))
    expect(document.documentElement.dataset.theme).toBeUndefined()
    expect(localStorage.getItem('constgua:tema')).toBeNull()
  })

  it('enlaza a mis apuntes', () => {
    renderRoute('/ajustes')
    expect(screen.getByRole('link', { name: 'Ir a mis apuntes' })).toHaveAttribute(
      'href',
      '/apuntes',
    )
  })
})

describe('continuar leyendo', () => {
  it('con la opción activada guarda el artículo que se lee', async () => {
    resetSettings({ rememberReading: true })
    renderRoute('/articulo/47')
    await waitFor(() => expect(saveLastArticle).toHaveBeenCalledWith(TEST_USER.uid, '47'), {
      timeout: 4000,
    })
  })

  it('con la opción desactivada no guarda nada', async () => {
    renderRoute('/articulo/47')
    await new Promise((resolve) => setTimeout(resolve, 2500))
    expect(saveLastArticle).not.toHaveBeenCalled()
  })

  it('el índice ofrece seguir leyendo desde el último artículo', async () => {
    const user = userEvent.setup()
    resetSettings({ rememberReading: true, lastArticleId: '47' })
    const { router } = renderRoute('/')

    const card = screen.getByRole('region', { name: 'Continúa donde te quedaste' })
    expect(within(card).getByText(getArticle('47')!.epigrafe!)).toBeInTheDocument()
    await user.click(within(card).getByRole('button', { name: 'Seguir leyendo' }))
    await waitFor(() => expect(router.state.location.pathname).toBe('/articulo/47'))
  })

  it('sin la opción activada el índice no muestra la tarjeta', () => {
    resetSettings({ rememberReading: false, lastArticleId: null })
    renderRoute('/')
    expect(screen.queryByText('Continúa donde te quedaste')).not.toBeInTheDocument()
  })
})

describe('eliminar la cuenta', () => {
  it('pide confirmación, elimina la cuenta y sale de este dispositivo', async () => {
    const user = userEvent.setup()
    renderRoute('/ajustes')
    await user.click(screen.getByRole('button', { name: 'Eliminar cuenta' }))

    const dialog = screen.getByRole('dialog', { name: '¿Eliminar tu cuenta?' })
    await user.click(within(dialog).getByRole('button', { name: 'Eliminar cuenta' }))

    await waitFor(() => expect(leaveAfterAccountDeletion).toHaveBeenCalled())
    expect(deleteAccount).toHaveBeenCalledTimes(1)
  })

  it('cancelar no elimina nada', async () => {
    const user = userEvent.setup()
    renderRoute('/ajustes')
    await user.click(screen.getByRole('button', { name: 'Eliminar cuenta' }))
    const dialog = screen.getByRole('dialog', { name: '¿Eliminar tu cuenta?' })
    await user.click(within(dialog).getByRole('button', { name: 'Cancelar' }))
    expect(deleteAccount).not.toHaveBeenCalled()
  })

  it('explica qué hacer si el navegador bloquea la ventana de Google', async () => {
    const user = userEvent.setup()
    deleteAccount.mockResolvedValueOnce('popup_blocked')
    renderRoute('/ajustes')
    await user.click(screen.getByRole('button', { name: 'Eliminar cuenta' }))
    const dialog = screen.getByRole('dialog', { name: '¿Eliminar tu cuenta?' })
    await user.click(within(dialog).getByRole('button', { name: 'Eliminar cuenta' }))

    expect(await within(dialog).findByRole('alert')).toHaveTextContent(
      'Tu navegador bloqueó la ventana de Google',
    )
    expect(leaveAfterAccountDeletion).not.toHaveBeenCalled()
  })

  it('después de eliminarla, la pantalla de ingreso lo confirma', async () => {
    setTestUser(null)
    renderRoute('/ingresar?cuenta=eliminada')
    expect(await screen.findByRole('status')).toHaveTextContent(
      'Tu cuenta y tus datos se eliminaron.',
    )
  })
})
