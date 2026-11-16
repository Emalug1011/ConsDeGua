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

beforeEach(() => {
  localStorage.clear()
  setTestUser(TEST_USER)
})

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})
