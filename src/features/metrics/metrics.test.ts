import { describe, expect, it, vi } from 'vitest'
import { TEST_USER } from '../../test/fakeAuthService'
import { ensureUserProfile } from '../auth/service'
import { registerDailyVisit } from './dailyVisit'
import { dayInGuatemala } from './day'
import { recordDailyActivity } from './service'

describe('dayInGuatemala', () => {
  it('usa la zona America/Guatemala (UTC-6)', () => {
    expect(dayInGuatemala(new Date('2026-11-16T05:59:00Z'))).toBe('2026-11-15')
    expect(dayInGuatemala(new Date('2026-11-16T06:00:00Z'))).toBe('2026-11-16')
  })
})

describe('registerDailyVisit', () => {
  const morning = new Date('2026-11-16T14:00:00Z')
  const evening = new Date('2026-11-17T02:00:00Z') // 20:00 del 16 en Guatemala
  const nextDay = new Date('2026-11-17T14:00:00Z')

  it('registra a la persona una sola vez por día', async () => {
    await registerDailyVisit(TEST_USER, morning)
    await registerDailyVisit(TEST_USER, evening)

    expect(ensureUserProfile).toHaveBeenCalledOnce()
    expect(recordDailyActivity).toHaveBeenCalledOnce()
    expect(recordDailyActivity).toHaveBeenCalledWith(TEST_USER.uid, '2026-11-16')
  })

  it('vuelve a registrar al día siguiente', async () => {
    await registerDailyVisit(TEST_USER, morning)
    await registerDailyVisit(TEST_USER, nextDay)

    expect(recordDailyActivity).toHaveBeenCalledTimes(2)
    expect(recordDailyActivity).toHaveBeenLastCalledWith(TEST_USER.uid, '2026-11-17')
  })

  it('reintenta en la próxima carga si falló la escritura', async () => {
    vi.mocked(recordDailyActivity).mockRejectedValueOnce(new Error('sin red'))
    await expect(registerDailyVisit(TEST_USER, morning)).rejects.toThrow()
    await registerDailyVisit(TEST_USER, morning)

    expect(recordDailyActivity).toHaveBeenCalledTimes(2)
  })
})
