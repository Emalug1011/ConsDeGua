/**
 * Pruebas de firestore.rules contra el emulador (npm run test:rules).
 * Cada regla tiene al menos un caso que debe pasar y uno que debe fallar.
 */
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from '@firebase/rules-unit-testing'
import {
  Timestamp,
  collection,
  deleteDoc,
  deleteField,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
  type Firestore,
} from 'firebase/firestore'
import { readFileSync } from 'node:fs'
import { afterAll, beforeAll, beforeEach, describe, it } from 'vitest'
import { dayInGuatemala } from '../../src/features/metrics/day.ts'

const PROJECT_ID = 'demo-constgua'
const ALICE = 'alice'
const BOB = 'bob'

let env: RulesTestEnvironment

beforeAll(async () => {
  env = await initializeTestEnvironment({
    projectId: PROJECT_ID,
    firestore: { rules: readFileSync('firestore.rules', 'utf8'), host: '127.0.0.1', port: 8080 },
  })
})

afterAll(async () => {
  await env.cleanup()
})

beforeEach(async () => {
  await env.clearFirestore()
})

function googleDb(uid: string, email = `${uid}@example.com`): Firestore {
  return env
    .authenticatedContext(uid, { email, firebase: { sign_in_provider: 'google.com' } })
    .firestore() as unknown as Firestore
}

function passwordDb(uid: string): Firestore {
  return env
    .authenticatedContext(uid, {
      email: `${uid}@example.com`,
      firebase: { sign_in_provider: 'password' },
    })
    .firestore() as unknown as Firestore
}

function anonymousDb(): Firestore {
  return env.unauthenticatedContext().firestore() as unknown as Firestore
}

function newProfile(uid: string) {
  return {
    displayName: 'Alice',
    email: `${uid}@example.com`,
    photoURL: null,
    createdAt: serverTimestamp(),
    lastSeenAt: serverTimestamp(),
  }
}

async function seedProfile(uid: string): Promise<void> {
  await env.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore() as unknown as Firestore
    await setDoc(doc(db, 'users', uid), {
      displayName: 'Alice',
      email: `${uid}@example.com`,
      photoURL: null,
      createdAt: Timestamp.fromDate(new Date('2026-01-01')),
      lastSeenAt: Timestamp.fromDate(new Date('2026-01-01')),
    })
  })
}

describe('users/{uid}', () => {
  it('la persona crea su propio perfil', async () => {
    await assertSucceeds(setDoc(doc(googleDb(ALICE), 'users', ALICE), newProfile(ALICE)))
  })

  it('nadie crea el perfil de otra persona', async () => {
    await assertFails(setDoc(doc(googleDb(BOB), 'users', ALICE), newProfile(ALICE)))
  })

  it('rechaza sesiones que no son de Google', async () => {
    await assertFails(setDoc(doc(passwordDb(ALICE), 'users', ALICE), newProfile(ALICE)))
  })

  it('rechaza escribir sin sesión', async () => {
    await assertFails(setDoc(doc(anonymousDb(), 'users', ALICE), newProfile(ALICE)))
  })

  it('rechaza un correo distinto al del token', async () => {
    const profile = { ...newProfile(ALICE), email: 'otra@example.com' }
    await assertFails(setDoc(doc(googleDb(ALICE), 'users', ALICE), profile))
  })

  it('rechaza campos de más', async () => {
    const profile = { ...newProfile(ALICE), rol: 'admin' }
    await assertFails(setDoc(doc(googleDb(ALICE), 'users', ALICE), profile))
  })

  it('rechaza un createdAt que no sea la hora del servidor', async () => {
    const profile = { ...newProfile(ALICE), createdAt: Timestamp.fromDate(new Date('2020-01-01')) }
    await assertFails(setDoc(doc(googleDb(ALICE), 'users', ALICE), profile))
  })

  it('rechaza un nombre demasiado largo', async () => {
    const profile = { ...newProfile(ALICE), displayName: 'a'.repeat(201) }
    await assertFails(setDoc(doc(googleDb(ALICE), 'users', ALICE), profile))
  })

  it('solo la persona lee su perfil', async () => {
    await seedProfile(ALICE)
    await assertSucceeds(getDoc(doc(googleDb(ALICE), 'users', ALICE)))
    await assertFails(getDoc(doc(googleDb(BOB), 'users', ALICE)))
  })

  it('la persona actualiza lastSeenAt, nombre y foto', async () => {
    await seedProfile(ALICE)
    await assertSucceeds(
      updateDoc(doc(googleDb(ALICE), 'users', ALICE), {
        displayName: 'Alice B.',
        photoURL: 'https://example.com/foto.png',
        lastSeenAt: serverTimestamp(),
      }),
    )
  })

  it('no se pueden cambiar createdAt ni email', async () => {
    await seedProfile(ALICE)
    const ref = doc(googleDb(ALICE), 'users', ALICE)
    await assertFails(
      updateDoc(ref, { createdAt: serverTimestamp(), lastSeenAt: serverTimestamp() }),
    )
    await assertFails(updateDoc(ref, { email: 'otra@example.com', lastSeenAt: serverTimestamp() }))
  })

  it('nadie actualiza el perfil de otra persona', async () => {
    await seedProfile(ALICE)
    await assertFails(
      updateDoc(doc(googleDb(BOB), 'users', ALICE), { lastSeenAt: serverTimestamp() }),
    )
  })

  it('la persona borra su perfil al eliminar su cuenta', async () => {
    await seedProfile(ALICE)
    await assertSucceeds(deleteDoc(doc(googleDb(ALICE), 'users', ALICE)))
  })

  it('nadie borra el perfil de otra persona', async () => {
    await seedProfile(ALICE)
    await assertFails(deleteDoc(doc(googleDb(BOB), 'users', ALICE)))
    await assertFails(deleteDoc(doc(anonymousDb(), 'users', ALICE)))
  })
})

describe('users/{uid}: ajustes de lectura', () => {
  it('la persona activa y desactiva la opción sin tocar lastSeenAt', async () => {
    await seedProfile(ALICE)
    const ref = doc(googleDb(ALICE), 'users', ALICE)
    await assertSucceeds(updateDoc(ref, { rememberReading: true }))
    await assertSucceeds(
      updateDoc(ref, {
        rememberReading: false,
        lastArticleId: deleteField(),
        lastReadAt: deleteField(),
      }),
    )
  })

  it('guarda el último artículo leído solo con la opción activada', async () => {
    await seedProfile(ALICE)
    const ref = doc(googleDb(ALICE), 'users', ALICE)
    await assertFails(updateDoc(ref, { lastArticleId: '47', lastReadAt: serverTimestamp() }))
    await assertSucceeds(updateDoc(ref, { rememberReading: true }))
    await assertSucceeds(updateDoc(ref, { lastArticleId: '47', lastReadAt: serverTimestamp() }))
    await assertSucceeds(updateDoc(ref, { lastArticleId: 'T27', lastReadAt: serverTimestamp() }))
  })

  it('rechaza artículos inválidos, tipos incorrectos y fechas que no son del servidor', async () => {
    await seedProfile(ALICE)
    const ref = doc(googleDb(ALICE), 'users', ALICE)
    await assertSucceeds(updateDoc(ref, { rememberReading: true }))
    await assertFails(updateDoc(ref, { lastArticleId: '999', lastReadAt: serverTimestamp() }))
    await assertFails(updateDoc(ref, { rememberReading: 'si' }))
    await assertFails(
      updateDoc(ref, {
        lastArticleId: '47',
        lastReadAt: Timestamp.fromDate(new Date('2020-01-01')),
      }),
    )
  })

  it('nadie cambia los ajustes de otra persona ni campos que no existen', async () => {
    await seedProfile(ALICE)
    await assertFails(updateDoc(doc(googleDb(BOB), 'users', ALICE), { rememberReading: true }))
    await assertFails(updateDoc(doc(googleDb(ALICE), 'users', ALICE), { tema: 'oscuro' }))
  })

  it('lastSeenAt sigue exigiendo la hora del servidor', async () => {
    await seedProfile(ALICE)
    const ref = doc(googleDb(ALICE), 'users', ALICE)
    await assertFails(updateDoc(ref, { lastSeenAt: Timestamp.fromDate(new Date('2020-01-01')) }))
    await assertSucceeds(updateDoc(ref, { lastSeenAt: serverTimestamp() }))
  })
})

describe('metrics_daily/{day}/users/{uid}', () => {
  const today = dayInGuatemala()

  it('la persona registra su visita de hoy', async () => {
    await assertSucceeds(
      setDoc(doc(googleDb(ALICE), 'metrics_daily', today, 'users', ALICE), {
        firstSeenAt: serverTimestamp(),
      }),
    )
  })

  it('nadie registra la visita de otra persona', async () => {
    await assertFails(
      setDoc(doc(googleDb(BOB), 'metrics_daily', today, 'users', ALICE), {
        firstSeenAt: serverTimestamp(),
      }),
    )
  })

  it('rechaza sesiones que no son de Google', async () => {
    await assertFails(
      setDoc(doc(passwordDb(ALICE), 'metrics_daily', today, 'users', ALICE), {
        firstSeenAt: serverTimestamp(),
      }),
    )
  })

  it('rechaza días lejanos o mal escritos', async () => {
    const db = googleDb(ALICE)
    const data = { firstSeenAt: serverTimestamp() }
    await assertFails(setDoc(doc(db, 'metrics_daily', '2020-01-01', 'users', ALICE), data))
    await assertFails(setDoc(doc(db, 'metrics_daily', 'hoy', 'users', ALICE), data))
  })

  it('rechaza campos de más o una hora que no sea la del servidor', async () => {
    const ref = doc(googleDb(ALICE), 'metrics_daily', today, 'users', ALICE)
    await assertFails(setDoc(ref, { firstSeenAt: serverTimestamp(), extra: 1 }))
    await assertFails(setDoc(ref, { firstSeenAt: Timestamp.now() }))
  })

  it('no se puede escribir dos veces el mismo día', async () => {
    const ref = doc(googleDb(ALICE), 'metrics_daily', today, 'users', ALICE)
    await assertSucceeds(setDoc(ref, { firstSeenAt: serverTimestamp() }))
    await assertFails(setDoc(ref, { firstSeenAt: serverTimestamp() }))
  })

  it('nadie lee las métricas desde el cliente', async () => {
    const ref = doc(googleDb(ALICE), 'metrics_daily', today, 'users', ALICE)
    await assertSucceeds(setDoc(ref, { firstSeenAt: serverTimestamp() }))
    await assertFails(getDoc(ref))
  })
})

describe('colecciones no declaradas', () => {
  it('se niegan por defecto', async () => {
    const db = googleDb(ALICE)
    await assertFails(setDoc(doc(db, 'diagrams', 'd1'), { ownerId: ALICE }))
    await assertFails(getDoc(doc(db, 'diagrams', 'd1')))
  })
})

describe('notes/{noteId}', () => {
  const EMPTY_DOC = { type: 'doc', content: [{ type: 'paragraph' }] }

  function newNote(ownerId: string, extra: Record<string, unknown> = {}) {
    return {
      ownerId,
      title: 'Garantías del detenido',
      content: EMPTY_DOC,
      articleId: '7',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      ...extra,
    }
  }

  async function seedNote(id: string, ownerId: string, articleId = '7'): Promise<void> {
    await env.withSecurityRulesDisabled(async (context) => {
      const db = context.firestore() as unknown as Firestore
      await setDoc(doc(db, 'notes', id), {
        ownerId,
        title: 'Apunte',
        content: EMPTY_DOC,
        articleId,
        createdAt: Timestamp.fromDate(new Date('2026-01-01')),
        updatedAt: Timestamp.fromDate(new Date('2026-01-01')),
      })
    })
  }

  it('la persona crea un apunte propio, con o sin artículo', async () => {
    const db = googleDb(ALICE)
    await assertSucceeds(setDoc(doc(db, 'notes', 'n1'), newNote(ALICE)))
    const { articleId: _omit, ...withoutArticle } = newNote(ALICE)
    void _omit
    await assertSucceeds(setDoc(doc(db, 'notes', 'n2'), withoutArticle))
    await assertSucceeds(setDoc(doc(db, 'notes', 'n3'), newNote(ALICE, { articleId: 'T27' })))
  })

  it('nadie crea un apunte a nombre de otra persona', async () => {
    await assertFails(setDoc(doc(googleDb(BOB), 'notes', 'n1'), newNote(ALICE)))
  })

  it('rechaza sesiones que no son de Google y sin sesión', async () => {
    await assertFails(setDoc(doc(passwordDb(ALICE), 'notes', 'n1'), newNote(ALICE)))
    await assertFails(setDoc(doc(anonymousDb(), 'notes', 'n1'), newNote(ALICE)))
  })

  it('valida título, contenido, artículo, campos y fechas', async () => {
    const db = googleDb(ALICE)
    const ref = doc(db, 'notes', 'n1')
    await assertFails(setDoc(ref, newNote(ALICE, { title: 'a'.repeat(201) })))
    await assertFails(setDoc(ref, newNote(ALICE, { content: 'texto plano' })))
    await assertFails(setDoc(ref, newNote(ALICE, { articleId: '282' })))
    await assertFails(setDoc(ref, newNote(ALICE, { articleId: 'T28' })))
    await assertFails(setDoc(ref, newNote(ALICE, { articleId: 7 })))
    await assertFails(setDoc(ref, newNote(ALICE, { publico: true })))
    await assertFails(
      setDoc(ref, newNote(ALICE, { createdAt: Timestamp.fromDate(new Date('2020-01-01')) })),
    )
  })

  it('solo la persona dueña lee su apunte', async () => {
    await seedNote('n1', ALICE)
    await assertSucceeds(getDoc(doc(googleDb(ALICE), 'notes', 'n1')))
    await assertFails(getDoc(doc(googleDb(BOB), 'notes', 'n1')))
    await assertFails(getDoc(doc(anonymousDb(), 'notes', 'n1')))
  })

  it('solo lista sus propios apuntes', async () => {
    await seedNote('n1', ALICE)
    await seedNote('n2', BOB)
    const mine = query(
      collection(googleDb(ALICE), 'notes'),
      where('ownerId', '==', ALICE),
      orderBy('updatedAt', 'desc'),
      limit(50),
    )
    await assertSucceeds(getDocs(mine))
    const byArticle = query(
      collection(googleDb(ALICE), 'notes'),
      where('ownerId', '==', ALICE),
      where('articleId', '==', '7'),
      orderBy('updatedAt', 'desc'),
      limit(50),
    )
    await assertSucceeds(getDocs(byArticle))
    // Pedir los de otra persona, o todos sin filtrar, se rechaza.
    await assertFails(
      getDocs(query(collection(googleDb(ALICE), 'notes'), where('ownerId', '==', BOB))),
    )
    await assertFails(getDocs(collection(googleDb(ALICE), 'notes')))
  })

  it('la persona edita su apunte y puede quitarle el artículo', async () => {
    await seedNote('n1', ALICE)
    const ref = doc(googleDb(ALICE), 'notes', 'n1')
    await assertSucceeds(
      updateDoc(ref, { title: 'Nuevo título', content: EMPTY_DOC, updatedAt: serverTimestamp() }),
    )
    await assertSucceeds(updateDoc(ref, { articleId: deleteField(), updatedAt: serverTimestamp() }))
  })

  it('no se puede cambiar el dueño ni la fecha de creación, ni omitir updatedAt', async () => {
    await seedNote('n1', ALICE)
    const ref = doc(googleDb(ALICE), 'notes', 'n1')
    await assertFails(updateDoc(ref, { ownerId: BOB, updatedAt: serverTimestamp() }))
    await assertFails(
      updateDoc(ref, { createdAt: serverTimestamp(), updatedAt: serverTimestamp() }),
    )
    await assertFails(updateDoc(ref, { title: 'Sin fecha' }))
  })

  it('nadie edita ni borra el apunte de otra persona', async () => {
    await seedNote('n1', ALICE)
    const ref = doc(googleDb(BOB), 'notes', 'n1')
    await assertFails(updateDoc(ref, { title: 'Ajeno', updatedAt: serverTimestamp() }))
    await assertFails(deleteDoc(ref))
  })

  it('la persona borra su apunte', async () => {
    await seedNote('n1', ALICE)
    await assertSucceeds(deleteDoc(doc(googleDb(ALICE), 'notes', 'n1')))
  })

  describe('eliminar la cuenta', () => {
    it('la persona borra en lote todos sus apuntes y su perfil', async () => {
      await seedProfile(ALICE)
      await seedNote('n1', ALICE)
      await seedNote('n2', ALICE)
      await seedNote('n3', BOB)
      const db = googleDb(ALICE)
      const mine = await getDocs(
        query(collection(db, 'notes'), where('ownerId', '==', ALICE), limit(200)),
      )
      const batch = writeBatch(db)
      mine.docs.forEach((note) => batch.delete(note.ref))
      batch.delete(doc(db, 'users', ALICE))
      await assertSucceeds(batch.commit())
    })

    it('un lote que incluye un apunte ajeno se rechaza completo', async () => {
      await seedNote('n1', ALICE)
      await seedNote('n3', BOB)
      const db = googleDb(ALICE)
      const batch = writeBatch(db)
      batch.delete(doc(db, 'notes', 'n1'))
      batch.delete(doc(db, 'notes', 'n3'))
      await assertFails(batch.commit())
    })
  })
})
