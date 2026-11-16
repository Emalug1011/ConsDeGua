import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, beforeEach, vi } from 'vitest'
import { TEST_USER, setTestUser } from './fakeAuthService'

// Las pruebas de componentes nunca hablan con Firebase.
vi.mock('../features/auth/service', () => import('./fakeAuthService'))
vi.mock('../features/metrics/service', () => ({
  recordDailyActivity: vi.fn(async () => undefined),
}))
vi.mock('../features/metrics/track', () => ({ track: vi.fn() }))

// jsdom no trae ResizeObserver ni DOMMatrixReadOnly, que usa React Flow.
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
globalThis.ResizeObserver ??= ResizeObserverStub
class DOMMatrixReadOnlyStub {
  m22 = 1
}
globalThis.DOMMatrixReadOnly ??= DOMMatrixReadOnlyStub as unknown as typeof DOMMatrixReadOnly

// jsdom no implementa scrollTo, que usa ScrollRestoration.
window.scrollTo = vi.fn() as unknown as typeof window.scrollTo

beforeEach(() => {
  localStorage.clear()
  delete document.documentElement.dataset.theme
  setTestUser(TEST_USER)
})

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})
