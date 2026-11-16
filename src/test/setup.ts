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

beforeEach(() => {
  localStorage.clear()
  setTestUser(TEST_USER)
})

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})
