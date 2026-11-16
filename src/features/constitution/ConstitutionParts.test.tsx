import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { renderRoute } from '../../test/renderRoute'
import { track } from '../metrics/track'
import { listArticles } from './catalog'
import { getConstitutionParts, getTransitionalTitle } from './constitutionParts'

describe('getConstitutionParts', () => {
  it('cubre los 281 artículos, sin huecos ni repeticiones, con los títulos I a VII', () => {
    const parts = getConstitutionParts()
    expect(parts.map((p) => p.titulos.map((t) => t.numero))).toEqual([
      ['I', 'II'],
      ['III', 'IV', 'V'],
      ['VI', 'VII'],
    ])
    expect(parts.reduce((sum, p) => sum + p.total, 0)).toBe(281)
    expect(parts[0]?.primero.id).toBe('1')
    expect(parts[2]?.ultimo.id).toBe('281')
    for (let i = 1; i < parts.length; i++) {
      expect(Number(parts[i]!.primero.id)).toBe(Number(parts[i - 1]!.ultimo.id) + 1)
    }
  })

  it('deja aparte las 27 disposiciones transitorias', () => {
    const transitional = getTransitionalTitle()
    expect(transitional.titulo.numero).toBe('VIII')
    expect(transitional.total).toBe(listArticles().filter((a) => a.transitorio).length)
  })
})

describe('diálogo de las tres partes', () => {
  it('se abre desde el índice, muestra las partes y se cierra', async () => {
    const user = userEvent.setup()
    renderRoute('/')

    await user.click(screen.getByRole('button', { name: 'Ver sus tres partes' }))

    const dialog = screen.getByRole('dialog', { name: 'Las tres partes de la Constitución' })
    expect(dialog).toHaveAttribute('open')
    for (const part of getConstitutionParts()) {
      expect(screen.getByRole('heading', { name: part.nombre })).toBeInTheDocument()
      expect(
        screen.getByText(
          `Artículos ${part.primero.id} a ${part.ultimo.id} · ${part.total} artículos`,
        ),
      ).toBeInTheDocument()
    }
    expect(screen.getByText(/esta división es doctrinal/)).toBeInTheDocument()
    expect(track).toHaveBeenCalledWith('constitution_parts_open')

    await user.click(screen.getByRole('button', { name: 'Cerrar' }))
    expect(dialog).not.toHaveAttribute('open')
  })

  it('lleva al primer artículo de una parte', async () => {
    const user = userEvent.setup()
    const { router } = renderRoute('/')
    const organica = getConstitutionParts()[1]!

    await user.click(screen.getByRole('button', { name: 'Ver sus tres partes' }))
    await user.click(screen.getByRole('link', { name: `Ir al artículo ${organica.primero.id}` }))

    await waitFor(() =>
      expect(router.state.location.pathname).toBe(`/articulo/${organica.primero.id}`),
    )
  })
})
