import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { DiagnosticsPanel } from './DiagnosticsPanel'

describe('panel de diagnóstico', () => {
  it('registra los toques sin datos personales', async () => {
    const user = userEvent.setup()
    render(
      <>
        <button type="button" aria-label="Ver mapa de relaciones" />
        <DiagnosticsPanel />
      </>,
    )
    await user.click(screen.getByRole('button', { name: 'Ver mapa de relaciones' }))
    const panel = screen.getByRole('complementary', { name: 'Diagnóstico' })
    expect(panel).toHaveTextContent('click → button "Ver mapa de relaciones"')
    expect(panel).toHaveTextContent('inicio')
  })
})
