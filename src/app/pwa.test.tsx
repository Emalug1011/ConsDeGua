import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useRegisterSW } from 'virtual:pwa-register/react'
import { renderRoute } from '../test/renderRoute'
import { track } from '../features/metrics/track'
import { captureInstallPrompt } from './installPrompt'
import { UpdatePrompt } from './UpdatePrompt'

function setOnline(value: boolean) {
  Object.defineProperty(navigator, 'onLine', { configurable: true, get: () => value })
}

describe('aviso de versión nueva', () => {
  it('no aparece si no hay versión nueva', () => {
    render(<UpdatePrompt />)
    expect(screen.queryByText(/versión nueva/)).not.toBeInTheDocument()
  })

  it('ofrece actualizar y no recarga sola', async () => {
    const user = userEvent.setup()
    const updateServiceWorker = vi.fn(async () => undefined)
    vi.mocked(useRegisterSW).mockReturnValue({
      needRefresh: [true, vi.fn()],
      offlineReady: [false, vi.fn()],
      updateServiceWorker,
    })
    render(<UpdatePrompt />)

    expect(screen.getByText('Hay una versión nueva de ConstGua.')).toBeInTheDocument()
    expect(updateServiceWorker).not.toHaveBeenCalled()
    await user.click(screen.getByRole('button', { name: 'Actualizar' }))
    expect(updateServiceWorker).toHaveBeenCalledWith(true)
  })
})

describe('sin conexión', () => {
  afterEach(() => setOnline(true))

  it('avisa cuando se pierde la conexión y desaparece al volver', () => {
    renderRoute('/')
    expect(screen.queryByText(/Sin conexión/)).not.toBeInTheDocument()

    act(() => {
      setOnline(false)
      window.dispatchEvent(new Event('offline'))
    })
    expect(screen.getByText(/Sin conexión/)).toBeInTheDocument()

    act(() => {
      setOnline(true)
      window.dispatchEvent(new Event('online'))
    })
    expect(screen.queryByText(/Sin conexión/)).not.toBeInTheDocument()
  })
})

describe('instalar la app', () => {
  it('solo aparece en Ajustes cuando el navegador permite instalar', async () => {
    const user = userEvent.setup()
    captureInstallPrompt()
    const { unmount } = renderRoute('/ajustes')
    expect(screen.queryByRole('heading', { name: 'Instalar la app' })).not.toBeInTheDocument()
    unmount()

    const prompt = vi.fn(async () => undefined)
    const event = Object.assign(new Event('beforeinstallprompt', { cancelable: true }), {
      prompt,
      userChoice: Promise.resolve({ outcome: 'accepted' as const }),
    })
    act(() => {
      window.dispatchEvent(event)
    })
    renderRoute('/ajustes')

    expect(event.defaultPrevented).toBe(true)
    await user.click(screen.getByRole('button', { name: 'Instalar' }))
    expect(prompt).toHaveBeenCalled()
    await vi.waitFor(() => expect(track).toHaveBeenCalledWith('app_install'))
    expect(screen.queryByRole('heading', { name: 'Instalar la app' })).not.toBeInTheDocument()
  })
})
