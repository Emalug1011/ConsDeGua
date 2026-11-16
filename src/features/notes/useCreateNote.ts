import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useAuth } from '../auth/useAuth'
import { track } from '../metrics/track'
import { createNote } from './service'

/** Crea un apunte (opcionalmente ligado a un artículo) y abre el editor. */
export function useCreateNote() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState(false)

  const create = async (articleId: string | null = null) => {
    if (!user) return
    setCreating(true)
    setError(false)
    try {
      const id = await createNote(user.uid, articleId)
      track('note_create')
      await navigate(`/apuntes/${id}`)
    } catch {
      setError(true)
    } finally {
      setCreating(false)
    }
  }

  return { create, creating, error }
}
