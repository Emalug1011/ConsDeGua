import { afterEach, describe, expect, it, vi } from 'vitest'
import { whenSaved } from './whenSaved'

function setOnline(value: boolean) {
  Object.defineProperty(navigator, 'onLine', { configurable: true, get: () => value })
}

describe('whenSaved', () => {
  afterEach(() => {
    setOnline(true)
    vi.useRealTimers()
  })

  it('responde saved cuando el servidor confirma', async () => {
    await expect(whenSaved(Promise.resolve())).resolves.toBe('saved')
  })

  it('propaga el error si la escritura falla', async () => {
    await expect(whenSaved(Promise.reject(new Error('rechazada')))).rejects.toThrow('rechazada')
  })

  it('sin conexión responde local sin esperar al servidor', async () => {
    vi.useFakeTimers()
    setOnline(false)
    const result = whenSaved(new Promise(() => undefined), 100)
    vi.advanceTimersByTime(150)
    await expect(result).resolves.toBe('local')
  })

  it('si se pierde la conexión mientras espera, responde local', async () => {
    const result = whenSaved(new Promise(() => undefined), 10_000)
    window.dispatchEvent(new Event('offline'))
    await expect(result).resolves.toBe('local')
  })
})
