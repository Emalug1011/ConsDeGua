import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { TEST_USER } from '../../test/fakeAuthService'
import { seedNote } from '../../test/fakeNotesService'
import { renderRoute } from '../../test/renderRoute'
import { getArticle } from '../constitution/catalog'
import { track } from '../metrics/track'
import { createNote, deleteNote, updateNote } from './service'
import { NoteTooLargeError } from './types'

const OTHER_USER = 'otra-persona'

describe('Mis apuntes', () => {
  it('muestra solo los apuntes de la persona, del más reciente al más antiguo', async () => {
    seedNote({ ownerId: TEST_USER.uid, title: 'Primero', articleId: '47' })
    seedNote({ ownerId: OTHER_USER, title: 'Ajeno' })
    seedNote({ ownerId: TEST_USER.uid, title: 'Segundo' })
    renderRoute('/apuntes')

    expect(screen.getByRole('heading', { name: 'Mis apuntes' })).toBeInTheDocument()
    expect(screen.getByText('Solo tú puedes ver tus apuntes.')).toBeInTheDocument()
    const links = within(screen.getByRole('list')).getAllByRole('link')
    expect(links.map((l) => l.querySelector('span')?.textContent)).toEqual(['Segundo', 'Primero'])
    expect(screen.queryByText('Ajeno')).not.toBeInTheDocument()
    expect(screen.getByText(/Art\. 47/)).toBeInTheDocument()
  })

  it('avisa cuando todavía no hay apuntes', () => {
    renderRoute('/apuntes')
    expect(screen.getByText(/Todavía no tienes apuntes/)).toBeInTheDocument()
  })

  it('crea un apunte y abre el editor', async () => {
    const user = userEvent.setup()
    const { router } = renderRoute('/apuntes')

    await user.click(screen.getByRole('button', { name: 'Crear apunte' }))

    expect(createNote).toHaveBeenCalledWith(TEST_USER.uid, null)
    expect(track).toHaveBeenCalledWith('note_create')
    // La ruta del editor se carga bajo demanda: la navegación termina al descargarla.
    expect(
      await screen.findByRole('textbox', { name: 'Título' }, { timeout: 5000 }),
    ).toBeInTheDocument()
    expect(router.state.location.pathname).toMatch(/^\/apuntes\/apunte-/)
  })

  it('se abre desde el menú de la cuenta', async () => {
    const user = userEvent.setup()
    const { router } = renderRoute('/')
    await user.click(screen.getByRole('button', { name: 'Abrir menú de tu cuenta' }))
    await user.click(screen.getByRole('link', { name: 'Mis apuntes' }))
    await waitFor(() => expect(router.state.location.pathname).toBe('/apuntes'))
  })
})

describe('editor de apuntes', () => {
  it('guarda los cambios con autoguardado diferido', async () => {
    const user = userEvent.setup()
    const id = seedNote({ ownerId: TEST_USER.uid, title: '' })
    renderRoute(`/apuntes/${id}`)

    const title = await screen.findByRole('textbox', { name: 'Título' })
    await user.type(title, 'Derecho de defensa')

    expect(screen.getByText('Cambios sin guardar')).toBeInTheDocument()
    expect(updateNote).not.toHaveBeenCalled()
    await waitFor(() => expect(screen.getByText('Guardado')).toBeInTheDocument(), {
      timeout: 4000,
    })
    // Un solo guardado para todo lo escrito, no uno por tecla.
    expect(updateNote).toHaveBeenCalledTimes(1)
    expect(updateNote).toHaveBeenCalledWith(
      id,
      expect.objectContaining({ title: 'Derecho de defensa', articleId: null }),
    )
    expect(track).toHaveBeenCalledWith('note_open')
  })

  it('tiene el editor de texto con su barra de formato', async () => {
    const id = seedNote({ ownerId: TEST_USER.uid })
    renderRoute(`/apuntes/${id}`)

    const toolbar = await screen.findByRole('toolbar', { name: 'Formato del apunte' })
    for (const name of ['Negrita', 'Cursiva', 'Lista con viñetas', 'Lista numerada', 'Cita']) {
      expect(within(toolbar).getByRole('button', { name })).toBeInTheDocument()
    }
    expect(screen.getByRole('textbox', { name: 'Contenido del apunte' })).toBeInTheDocument()
  })

  it('liga el apunte a un artículo válido y rechaza uno que no existe', async () => {
    const user = userEvent.setup()
    const id = seedNote({ ownerId: TEST_USER.uid })
    renderRoute(`/apuntes/${id}`)
    const field = await screen.findByRole('textbox', { name: 'Artículo (opcional)' })

    await user.type(field, '999')
    expect(screen.getByText(/No existe ese artículo/)).toBeInTheDocument()

    await user.clear(field)
    await user.type(field, '47')
    const article = getArticle('47')!
    expect(screen.getByText(`Artículo 47: ${article.epigrafe}`)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Ver Artículo 47' })).toHaveAttribute(
      'href',
      '/articulo/47',
    )
    await waitFor(
      () =>
        expect(updateNote).toHaveBeenLastCalledWith(
          id,
          expect.objectContaining({ articleId: '47' }),
        ),
      { timeout: 4000 },
    )
  })

  it('avisa si el apunte es demasiado grande y no lo guarda', async () => {
    const user = userEvent.setup()
    vi.mocked(updateNote).mockRejectedValueOnce(new NoteTooLargeError())
    const id = seedNote({ ownerId: TEST_USER.uid })
    renderRoute(`/apuntes/${id}`)

    await user.type(await screen.findByRole('textbox', { name: 'Título' }), 'Largo')

    expect(
      await screen.findByText(/demasiado grande para guardarse/, {}, { timeout: 4000 }),
    ).toBeInTheDocument()
  })

  it('elimina el apunte tras confirmar', async () => {
    const user = userEvent.setup()
    const id = seedNote({ ownerId: TEST_USER.uid, title: 'Para borrar' })
    const { router } = renderRoute(`/apuntes/${id}`)

    await user.click(await screen.findByRole('button', { name: 'Eliminar apunte' }))
    const dialog = screen.getByRole('dialog', { name: '¿Eliminar este apunte?' })
    await user.click(within(dialog).getByRole('button', { name: 'Eliminar' }))

    expect(deleteNote).toHaveBeenCalledWith(id)
    await waitFor(() => expect(router.state.location.pathname).toBe('/apuntes'))
  })

  it('avisa si el apunte no existe', async () => {
    renderRoute('/apuntes/no-existe')
    expect(
      await screen.findByRole('heading', { name: 'No encontramos este apunte' }),
    ).toBeInTheDocument()
  })
})

describe('apuntes en la vista de artículo', () => {
  it('muestra los apuntes de la persona de ese artículo y crea uno ligado', async () => {
    const user = userEvent.setup()
    seedNote({ ownerId: TEST_USER.uid, title: 'Sobre el 47', articleId: '47' })
    seedNote({ ownerId: TEST_USER.uid, title: 'Sobre el 48', articleId: '48' })
    seedNote({ ownerId: OTHER_USER, title: 'Ajeno del 47', articleId: '47' })
    renderRoute('/articulo/47')

    const section = screen.getByRole('region', { name: 'Mis apuntes' })
    expect(within(section).getByText('Sobre el 47')).toBeInTheDocument()
    expect(within(section).queryByText('Sobre el 48')).not.toBeInTheDocument()
    expect(within(section).queryByText('Ajeno del 47')).not.toBeInTheDocument()

    await user.click(within(section).getByRole('button', { name: 'Crear apunte' }))
    expect(createNote).toHaveBeenCalledWith(TEST_USER.uid, '47')
  })
})
