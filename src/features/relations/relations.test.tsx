import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { TEST_USER } from '../../test/fakeAuthService'
import { resetRelations } from '../../test/fakeRelationsService'
import { renderRoute } from '../../test/renderRoute'
import { track } from '../metrics/track'
import { createRelation, deleteRelation, updateRelation } from './service'

function section() {
  return screen.getByRole('region', { name: 'Artículos relacionados' })
}

describe('relaciones propias', () => {
  it('crea una relación con otro artículo, con tipo, dirección y nota', async () => {
    const user = userEvent.setup()
    renderRoute('/articulo/12')

    await user.click(within(section()).getByRole('button', { name: 'Agregar relación' }))
    const dialog = screen.getByRole('dialog', { name: 'Agregar relación' })
    await user.type(within(dialog).getByRole('searchbox', { name: 'Buscar artículo' }), '14')
    await user.click(within(dialog).getByRole('button', { name: /^Art\. 14/ }))
    await user.click(within(dialog).getByRole('radio', { name: /^Garantía/ }))
    await user.click(within(dialog).getByRole('radio', { name: 'Art. 14 → Art. 12' }))
    await user.type(within(dialog).getByRole('textbox', { name: 'Nota (opcional)' }), 'Mi nota')
    await user.click(within(dialog).getByRole('button', { name: 'Guardar' }))

    expect(createRelation).toHaveBeenCalledWith(TEST_USER.uid, {
      desde: '14',
      hacia: '12',
      haciaBloque: null,
      tipo: 'garantia',
      nota: 'Mi nota',
    })
    expect(track).toHaveBeenCalledWith('relation_create', { article_id: '14' })
    // Aparece en la lista, marcada como propia.
    await waitFor(() => expect(within(section()).getByText('Tu relación')).toBeInTheDocument())
    expect(within(section()).getByText('Mi nota', { selector: 'li p' })).toBeInTheDocument()
  })

  it('crea una relación hacia un capítulo completo', async () => {
    const user = userEvent.setup()
    renderRoute('/articulo/280')

    await user.click(within(section()).getByRole('button', { name: 'Agregar relación' }))
    const dialog = screen.getByRole('dialog', { name: 'Agregar relación' })
    await user.click(within(dialog).getByRole('radio', { name: 'Un capítulo completo' }))
    await user.selectOptions(within(dialog).getByRole('combobox', { name: 'Capítulo' }), 'II|I')
    await user.click(within(dialog).getByRole('button', { name: 'Guardar' }))

    expect(createRelation).toHaveBeenCalledWith(
      TEST_USER.uid,
      expect.objectContaining({
        desde: '280',
        hacia: null,
        haciaBloque: { titulo: 'II', capitulo: 'I' },
      }),
    )
  })

  it('no deja guardar una relación repetida', async () => {
    const user = userEvent.setup()
    resetRelations([{ desde: '12', hacia: '14', haciaBloque: null, tipo: 'remision', nota: '' }])
    renderRoute('/articulo/12')

    await user.click(within(section()).getByRole('button', { name: 'Agregar relación' }))
    const dialog = screen.getByRole('dialog', { name: 'Agregar relación' })
    await user.type(within(dialog).getByRole('searchbox', { name: 'Buscar artículo' }), '14')
    await user.click(within(dialog).getByRole('button', { name: /^Art\. 14/ }))

    expect(within(dialog).getByText(/Ya tienes esta misma relación/)).toBeInTheDocument()
    expect(within(dialog).getByRole('button', { name: 'Guardar' })).toBeDisabled()
  })

  it('edita y elimina una relación propia', async () => {
    const user = userEvent.setup()
    resetRelations([{ desde: '12', hacia: '14', haciaBloque: null, tipo: 'remision', nota: '' }])
    renderRoute('/articulo/12')

    await user.click(within(section()).getByRole('button', { name: 'Editar' }))
    const edit = screen.getByRole('dialog', { name: 'Editar relación' })
    await user.click(within(edit).getByRole('radio', { name: /^Límite/ }))
    await user.click(within(edit).getByRole('button', { name: 'Guardar' }))
    expect(updateRelation).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ desde: '12', hacia: '14', tipo: 'limite' }),
    )

    await user.click(within(section()).getByRole('button', { name: 'Eliminar' }))
    const confirm = screen.getByRole('dialog', { name: '¿Eliminar esta relación?' })
    await user.click(within(confirm).getByRole('button', { name: 'Eliminar' }))
    expect(deleteRelation).toHaveBeenCalled()
    await waitFor(() =>
      expect(within(section()).queryByText('Tu relación')).not.toBeInTheDocument(),
    )
  })

  it('las relaciones del catálogo no tienen Editar ni Eliminar', () => {
    renderRoute('/articulo/138')
    expect(within(section()).queryByRole('button', { name: 'Editar' })).not.toBeInTheDocument()
  })

  it('el mapa ofrece el filtro de origen y muestra las propias en su lista', async () => {
    const user = userEvent.setup()
    resetRelations([{ desde: '12', hacia: '14', haciaBloque: null, tipo: 'garantia', nota: '' }])
    renderRoute('/articulo/12')

    await user.click(within(section()).getByRole('button', { name: 'Ver mapa de relaciones' }))
    const dialog = screen.getByRole('dialog', { name: /^Mapa de relaciones de Artículo 12/ })
    expect(within(dialog).getByRole('group', { name: 'Origen' })).toBeInTheDocument()
    expect(within(dialog).getByText('Tu relación')).toBeInTheDocument()

    await user.click(within(dialog).getByRole('button', { name: 'Mías' }))
    expect(within(dialog).queryByText('Tu relación')).not.toBeInTheDocument()
  })
})
