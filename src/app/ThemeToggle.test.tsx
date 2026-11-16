import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { renderRoute } from '../test/renderRoute'
import { applyStoredTheme } from './theme'

describe('modo claro y oscuro', () => {
  it('alterna el tema y lo recuerda', async () => {
    const user = userEvent.setup()
    renderRoute('/')

    await user.click(screen.getByRole('button', { name: 'Cambiar a modo oscuro' }))
    expect(document.documentElement.dataset.theme).toBe('dark')
    expect(localStorage.getItem('constgua:tema')).toBe('dark')

    await user.click(screen.getByRole('button', { name: 'Cambiar a modo claro' }))
    expect(document.documentElement.dataset.theme).toBe('light')
    expect(localStorage.getItem('constgua:tema')).toBe('light')
  })

  it('al arrancar aplica el tema guardado y, si no hay, sigue al sistema', () => {
    localStorage.setItem('constgua:tema', 'dark')
    applyStoredTheme()
    expect(document.documentElement.dataset.theme).toBe('dark')

    localStorage.clear()
    applyStoredTheme()
    expect(document.documentElement.dataset.theme).toBeUndefined()
  })
})
