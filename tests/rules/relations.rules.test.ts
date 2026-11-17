/**
 * Pruebas de las reglas de `relations` (relaciones propias) contra el emulador.
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
  type Firestore,
} from 'firebase/firestore'
import { readFileSync } from 'node:fs'
import { afterAll, beforeAll, beforeEach, describe, it } from 'vitest'

const ALICE = 'alice'
const BOB = 'bob'

let env: RulesTestEnvironment

beforeAll(async () => {
  env = await initializeTestEnvironment({
    projectId: 'demo-constgua',
    firestore: { rules: readFileSync('firestore.rules', 'utf8'), host: '127.0.0.1', port: 8080 },
  })
})

afterAll(async () => {
  await env.cleanup()
})

beforeEach(async () => {
  await env.clearFirestore()
})

function googleDb(uid: string): Firestore {
  return env
    .authenticatedContext(uid, {
      email: `${uid}@example.com`,
      firebase: { sign_in_provider: 'google.com' },
    })
    .firestore() as unknown as Firestore
}

function relation(ownerId: string, extra: Record<string, unknown> = {}) {
  return {
    ownerId,
    desde: '12',
    hacia: '14',
    tipo: 'garantia',
    nota: 'Defensa y presunción de inocencia.',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    ...extra,
  }
}

async function seed(id: string, ownerId: string): Promise<void> {
  await env.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore() as unknown as Firestore
    await setDoc(doc(db, 'relations', id), {
      ownerId,
      desde: '12',
      hacia: '14',
      tipo: 'garantia',
      createdAt: Timestamp.fromDate(new Date('2026-01-01')),
      updatedAt: Timestamp.fromDate(new Date('2026-01-01')),
    })
  })
}

describe('relations/{id}', () => {
  it('la persona crea relaciones propias entre artículos y hacia un capítulo', async () => {
    const db = googleDb(ALICE)
    await assertSucceeds(setDoc(doc(db, 'relations', 'r1'), relation(ALICE)))
    const { nota: _nota, ...sinNota } = relation(ALICE, { tipo: 'tematica' })
    void _nota
    await assertSucceeds(setDoc(doc(db, 'relations', 'r2'), sinNota))
    const { hacia: _hacia, ...base } = relation(ALICE, {
      desde: '278',
      tipo: 'remision',
      haciaBloque: { titulo: 'II', capitulo: 'I' },
    })
    void _hacia
    await assertSucceeds(setDoc(doc(db, 'relations', 'r3'), base))
  })

  it('nadie crea relaciones a nombre de otra persona ni sin sesión de Google', async () => {
    await assertFails(setDoc(doc(googleDb(BOB), 'relations', 'r1'), relation(ALICE)))
    const password = env
      .authenticatedContext(ALICE, { firebase: { sign_in_provider: 'password' } })
      .firestore() as unknown as Firestore
    await assertFails(setDoc(doc(password, 'relations', 'r1'), relation(ALICE)))
    const anonymous = env.unauthenticatedContext().firestore() as unknown as Firestore
    await assertFails(setDoc(doc(anonymous, 'relations', 'r1'), relation(ALICE)))
  })

  it('exige exactamente un destino: otro artículo o un capítulo', async () => {
    const ref = doc(googleDb(ALICE), 'relations', 'r1')
    // Los dos a la vez.
    await assertFails(
      setDoc(ref, relation(ALICE, { haciaBloque: { titulo: 'II', capitulo: 'I' } })),
    )
    // Ninguno.
    const { hacia: _hacia, ...sinDestino } = relation(ALICE)
    void _hacia
    await assertFails(setDoc(ref, sinDestino))
  })

  it('valida artículos, tipo, capítulo, nota y fechas', async () => {
    const ref = doc(googleDb(ALICE), 'relations', 'r1')
    await assertFails(setDoc(ref, relation(ALICE, { hacia: '12' })))
    await assertFails(setDoc(ref, relation(ALICE, { hacia: '282' })))
    await assertFails(setDoc(ref, relation(ALICE, { desde: 'T28' })))
    await assertFails(setDoc(ref, relation(ALICE, { tipo: 'otra' })))
    await assertFails(setDoc(ref, relation(ALICE, { nota: 'a'.repeat(501) })))
    await assertFails(setDoc(ref, relation(ALICE, { publica: true })))
    await assertFails(
      setDoc(ref, relation(ALICE, { createdAt: Timestamp.fromDate(new Date('2020-01-01')) })),
    )
    const { hacia: _hacia, ...base } = relation(ALICE)
    void _hacia
    await assertFails(setDoc(ref, { ...base, haciaBloque: { titulo: 'IX', capitulo: 'I' } }))
    await assertFails(
      setDoc(ref, { ...base, haciaBloque: { titulo: 'II', capitulo: 'I', desde: '3' } }),
    )
  })

  it('solo la persona dueña lee y lista sus relaciones', async () => {
    await seed('r1', ALICE)
    await seed('r2', BOB)
    await assertSucceeds(getDoc(doc(googleDb(ALICE), 'relations', 'r1')))
    await assertFails(getDoc(doc(googleDb(BOB), 'relations', 'r1')))
    const mine = query(
      collection(googleDb(ALICE), 'relations'),
      where('ownerId', '==', ALICE),
      orderBy('updatedAt', 'desc'),
      limit(500),
    )
    await assertSucceeds(getDocs(mine))
    await assertFails(getDocs(collection(googleDb(ALICE), 'relations')))
  })

  it('la persona edita y borra la suya; no puede cambiar dueño ni creación', async () => {
    await seed('r1', ALICE)
    const ref = doc(googleDb(ALICE), 'relations', 'r1')
    await assertSucceeds(updateDoc(ref, { tipo: 'limite', updatedAt: serverTimestamp() }))
    await assertFails(updateDoc(ref, { ownerId: BOB, updatedAt: serverTimestamp() }))
    await assertFails(
      updateDoc(ref, { createdAt: serverTimestamp(), updatedAt: serverTimestamp() }),
    )
    await assertFails(updateDoc(ref, { tipo: 'desarrollo' }))
    await assertSucceeds(deleteDoc(ref))
  })

  it('nadie edita ni borra la relación de otra persona', async () => {
    await seed('r1', ALICE)
    const ref = doc(googleDb(BOB), 'relations', 'r1')
    await assertFails(updateDoc(ref, { tipo: 'limite', updatedAt: serverTimestamp() }))
    await assertFails(deleteDoc(ref))
  })
})
