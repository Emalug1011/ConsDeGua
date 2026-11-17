import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { TEST_USER } from '../../test/fakeAuthService'
import { seedNote } from '../../test/fakeNotesService'
import { renderRoute } from '../../test/renderRoute'
import { track } from '../metrics/track'
import { createNote, deleteNote, updateNote } from './service'
import { NoteTooLargeError } from './types'

const OTHER_USER = 'otra-persona'
/** El editor se descarga bajo demanda: en pruebas puede tardar más de un segundo. */
const EDITOR_TIMEOUT = { timeout: 15000 }
const SAVE_TIMEOUT = { timeout: 10000 }

async function findTitleField() {
  return screen.findByRole('textbox', { name: 'Título' }, EDITOR_TIMEOUT)
}

describe('Mis apuntes', () => {
  it('muestra solo los apuntes de la persona, del más reciente al más antiguo', () => {
    seedNote({ ownerId: TEST_USER.uid, title: 'Primero', articleId: '47' })
    seedNote({ ownerId: OTHER_USER, title: 'Ajeno' })
    seedNote({ ownerId: TEST_USER.uid, title: 'Segundo' })
    renderRoute('/apuntes')

    expect(screen.getByRole('heading', { name: 'Mis apuntes' })).toBeInTheDocument()
    expect(screen.getByText('Solo tú puedes ver tus apuntes.')).toBeInTheDocument()
    const items = within(screen.getByRole('list')).getAllByRole('button')
    expect(items.map((b) => b.querySelector('span')?.textContent)).toEqual(['Segundo', 'Primero'])
    expect(screen.queryByText('Ajeno')).not.toBeInTheDocument()
    expect(screen.getByText(/Art\. 47/)).toBeInTheDocument()
  })

  it('avisa cuando todavía no hay apuntes', () => {
    renderRoute('/apuntes')
    expect(screen.getByText(/Todavía no tienes apuntes/)).toBeInTheDocument()
  })

  it('abre un apunte en un diálogo, sin cambiar de página', async () => {
    const user = userEvent.setup()
    seedNote({ ownerId: TEST_USER.uid, title: 'Garantías', articleId: '7' })
    const { router } = renderRoute('/apuntes')

    await user.click(screen.getByRole('button', { name: /Garantías/ }))

    const dialog = screen.getByRole('dialog', { name: 'Apunte · Artículo 7' })
    expect(dialog).toHaveAttribute('open')
    expect(await findTitleField()).toHaveValue('Garantías')
    expect(router.state.location.pathname).toBe('/apuntes')
    expect(track).toHaveBeenCalledWith('note_open')
  })

  it('crea el apunte al escribir, no al abrir el diálogo', async () => {
    const user = userEvent.setup()
    renderRoute('/apuntes')

    await user.click(screen.getByRole('button', { name: 'Crear apunte' }))
    expect(screen.getByRole('dialog', { name: 'Apunte' })).toHaveAttribute('open')
    const title = await findTitleField()
    expect(createNote).not.toHaveBeenCalled()

    await user.type(title, 'Nuevo')
    await waitFor(() => expect(screen.getByText('Guardado')).toBeInTheDocument(), SAVE_TIMEOUT)
    expect(createNote).toHaveBeenCalledTimes(1)
    expect(createNote).toHaveBeenCalledWith(
      TEST_USER.uid,
      expect.objectContaining({ title: 'Nuevo', articleId: null }),
    )
    expect(track).toHaveBeenCalledWith('note_create')
  })

  it('cerrar sin escribir no deja apuntes vacíos', async () => {
    const user = userEvent.setup()
    renderRoute('/apuntes')

    await user.click(screen.getByRole('button', { name: 'Crear apunte' }))
    await findTitleField()
    await user.click(screen.getByRole('button', { name: 'Cerrar' }))

    expect(createNote).not.toHaveBeenCalled()
    expect(screen.getByText(/Todavía no tienes apuntes/)).toBeInTheDocument()
  })
})

describe('editor de apuntes', () => {
  it('guarda con autoguardado diferido: un solo guardado para todo lo escrito', async () => {
    const user = userEvent.setup()
    seedNote({ ownerId: TEST_USER.uid, title: '' })
    renderRoute('/apuntes')
    await user.click(screen.getByRole('button', { name: /Sin título/ }))

    await user.type(await findTitleField(), 'Derecho de defensa')

    expect(screen.getByText('Cambios sin guardar')).toBeInTheDocument()
    expect(updateNote).not.toHaveBeenCalled()
    await waitFor(() => expect(screen.getByText('Guardado')).toBeInTheDocument(), SAVE_TIMEOUT)
    expect(updateNote).toHaveBeenCalledTimes(1)
    expect(updateNote).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ title: 'Derecho de defensa' }),
    )
  })

  it('tiene el editor de texto con su barra de formato y no pide el artículo', async () => {
    const user = userEvent.setup()
    renderRoute('/apuntes')
    await user.click(screen.getByRole('button', { name: 'Crear apunte' }))

    const toolbar = await screen.findByRole(
      'toolbar',
      { name: 'Formato del apunte' },
      EDITOR_TIMEOUT,
    )
    for (const name of ['Negrita', 'Cursiva', 'Lista con viñetas', 'Lista numerada', 'Cita']) {
      expect(within(toolbar).getByRole('button', { name })).toBeInTheDocument()
    }
    expect(screen.getByRole('textbox', { name: 'Contenido del apunte' })).toBeInTheDocument()
    expect(screen.queryByRole('textbox', { name: /Artículo/ })).not.toBeInTheDocument()
  })

  it('avisa si el apunte es demasiado grande y no lo guarda', async () => {
    const user = userEvent.setup()
    vi.mocked(updateNote).mockRejectedValueOnce(new NoteTooLargeError())
    seedNote({ ownerId: TEST_USER.uid, title: 'Largo' })
    renderRoute('/apuntes')
    await user.click(screen.getByRole('button', { name: /Largo/ }))

    await user.type(await findTitleField(), ' más')

    expect(
      await screen.findByText(/demasiado grande para guardarse/, {}, SAVE_TIMEOUT),
    ).toBeInTheDocument()
  })

  it('elimina el apunte tras confirmar y cierra el diálogo', async () => {
    const user = userEvent.setup()
    const id = seedNote({ ownerId: TEST_USER.uid, title: 'Para borrar' })
    renderRoute('/apuntes')
    await user.click(screen.getByRole('button', { name: /Para borrar/ }))
    await findTitleField()

    await user.click(screen.getByRole('button', { name: 'Eliminar apunte' }))
    const confirm = screen.getByRole('dialog', { name: '¿Eliminar este apunte?' })
    await user.click(within(confirm).getByRole('button', { name: 'Eliminar' }))

    expect(deleteNote).toHaveBeenCalledWith(id)
    await waitFor(() =>
      expect(screen.queryByRole('button', { name: /Para borrar/ })).not.toBeInTheDocument(),
    )
    expect(screen.queryByRole('textbox', { name: 'Título' })).not.toBeInTheDocument()
  })
})

describe('apuntes en la vista de artículo', () => {
  it('muestra solo los apuntes de la persona de ese artículo', () => {
    seedNote({ ownerId: TEST_USER.uid, title: 'Sobre el 47', articleId: '47' })
    seedNote({ ownerId: TEST_USER.uid, title: 'Sobre el 48', articleId: '48' })
    seedNote({ ownerId: OTHER_USER, title: 'Ajeno del 47', articleId: '47' })
    renderRoute('/articulo/47')

    const section = screen.getByRole('region', { name: 'Mis apuntes' })
    expect(within(section).getByText('Sobre el 47')).toBeInTheDocument()
    expect(within(section).queryByText('Sobre el 48')).not.toBeInTheDocument()
    expect(within(section).queryByText('Ajeno del 47')).not.toBeInTheDocument()
  })

  it('crea el apunte en un diálogo ligado al artículo automáticamente', async () => {
    const user = userEvent.setup()
    const { router } = renderRoute('/articulo/47')
    const section = screen.getByRole('region', { name: 'Mis apuntes' })

    await user.click(within(section).getByRole('button', { name: 'Crear apunte' }))

    expect(screen.getByRole('dialog', { name: 'Apunte · Artículo 47' })).toHaveAttribute('open')
    await user.type(await findTitleField(), 'Familia')
    await waitFor(
      () =>
        expect(createNote).toHaveBeenCalledWith(
          TEST_USER.uid,
          expect.objectContaining({ title: 'Familia', articleId: '47' }),
        ),
      SAVE_TIMEOUT,
    )
    expect(router.state.location.pathname).toBe('/articulo/47')
    await waitFor(() => expect(within(section).getByText('Familia')).toBeInTheDocument())
  })
})

describe('apuntes sin conexión', () => {
  it('sin internet avisa que quedó guardado en el dispositivo', async () => {
    const user = userEvent.setup()
    seedNote({ ownerId: TEST_USER.uid, title: 'Sin red' })
    // Sin conexión, Firestore deja la escritura pendiente: la promesa no se resuelve.
    vi.mocked(updateNote).mockReturnValueOnce(new Promise(() => undefined))
    Object.defineProperty(navigator, 'onLine', { configurable: true, get: () => false })
    try {
      renderRoute('/apuntes')
      await user.click(screen.getByRole('button', { name: /Sin red/ }))
      await user.type(await findTitleField(), ' 2')
      expect(
        await screen.findByText(/Guardado en este dispositivo/, {}, { timeout: 6000 }),
      ).toBeInTheDocument()
    } finally {
      Object.defineProperty(navigator, 'onLine', { configurable: true, get: () => true })
    }
  })
})
