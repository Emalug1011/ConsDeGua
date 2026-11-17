import { useId, useMemo, useState } from 'react'
import { Button } from '../../ui/Button'
import { Dialog } from '../../ui/Dialog'
import { Icon } from '../../ui/Icon'
import { TextField } from '../../ui/TextField'
import { useAuth } from '../auth/useAuth'
import {
  UNDIRECTED_RELATION_TYPE,
  getArticle,
  getBlock,
  getRelationTypeDefinitions,
  getStructure,
  search,
} from '../constitution/catalog'
import { articleLabel, articleShortLabel } from '../constitution/format'
import { relationTypeLabel } from '../diagrams/relationLabels'
import { whenSaved } from '../../lib/whenSaved'
import { track } from '../metrics/track'
import styles from './RelationFormDialog.module.css'
import { createRelation, updateRelation } from './service'
import {
  RELATION_NOTE_MAX_LENGTH,
  RELATION_TYPES,
  type RelationInput,
  type RelationType,
  type UserRelation,
} from './types'
import { useMyRelations } from './useMyRelations'

type Target = 'articulo' | 'capitulo'
type Direction = 'saliente' | 'entrante'

interface RelationFormDialogProps {
  open: boolean
  onClose: () => void
  /** Artículo desde el que se abrió el formulario. */
  articleId: string
  /** Relación a editar; sin ella, se crea una nueva. */
  relation?: UserRelation
}

interface FormState {
  target: Target
  otherId: string | null
  block: string
  tipo: RelationType
  direction: Direction
  nota: string
}

const BLOCK_SEPARATOR = '|'

function initialState(articleId: string, relation?: UserRelation): FormState {
  if (!relation) {
    return {
      target: 'articulo',
      otherId: null,
      block: '',
      tipo: 'remision',
      direction: 'saliente',
      nota: '',
    }
  }
  const outgoing = relation.desde === articleId
  return {
    target: relation.haciaBloque ? 'capitulo' : 'articulo',
    otherId: relation.hacia ? (outgoing ? relation.hacia : relation.desde) : null,
    block: relation.haciaBloque
      ? `${relation.haciaBloque.titulo}${BLOCK_SEPARATOR}${relation.haciaBloque.capitulo}`
      : '',
    tipo: relation.tipo,
    direction: outgoing ? 'saliente' : 'entrante',
    nota: relation.nota,
  }
}

/** Opciones de capítulo: todos los capítulos del catálogo con su rango de artículos. */
function blockOptions() {
  return getStructure().flatMap((title) =>
    title.capitulos.map((chapter) => {
      const block = getBlock(title.numero, chapter.numero)
      const range = block ? ` (artículos ${block.desdeArticulo} a ${block.hastaArticulo})` : ''
      return {
        value: `${title.numero}${BLOCK_SEPARATOR}${chapter.numero}`,
        label: `Título ${title.numero} · Capítulo ${chapter.numero}. ${chapter.nombre}${range}`,
      }
    }),
  )
}

/** Crear o editar una relación propia, sin salir de la página. */
export function RelationFormDialog({
  open,
  onClose,
  articleId,
  relation,
}: RelationFormDialogProps) {
  const { user } = useAuth()
  const mine = useMyRelations()
  const id = useId()
  // Para editar una relación hacia un capítulo, el punto de partida es su artículo de origen.
  const anchorId = relation?.haciaBloque ? relation.desde : articleId
  const anchor = getArticle(anchorId)
  const [form, setForm] = useState<FormState>(() => initialState(anchorId, relation))
  const [query, setQuery] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(false)
  const blocks = useMemo(() => blockOptions(), [])
  const definitions = getRelationTypeDefinitions()

  const results = useMemo(
    () => (query.trim().length >= 1 ? search(query, 8).filter((a) => a.id !== anchorId) : []),
    [query, anchorId],
  )

  if (!anchor) return null
  const other = form.otherId ? getArticle(form.otherId) : undefined
  const undirected = form.tipo === UNDIRECTED_RELATION_TYPE
  const update = (changes: Partial<FormState>) => setForm((current) => ({ ...current, ...changes }))

  const input = (): RelationInput | null => {
    if (form.target === 'articulo') {
      if (!form.otherId) return null
      const outgoing = undirected || form.direction === 'saliente'
      return {
        desde: outgoing ? anchorId : form.otherId,
        hacia: outgoing ? form.otherId : anchorId,
        haciaBloque: null,
        tipo: form.tipo,
        nota: form.nota,
      }
    }
    const [titulo, capitulo] = form.block.split(BLOCK_SEPARATOR)
    if (!titulo || !capitulo) return null
    return {
      desde: anchorId,
      hacia: null,
      haciaBloque: { titulo, capitulo },
      tipo: form.tipo,
      nota: form.nota,
    }
  }

  const candidate = input()
  // Misma relación ya creada (sin contar la que se está editando). Mientras se
  // guarda no se compara: la nueva ya aparece en la lista antes de confirmarse.
  const duplicate =
    !saving &&
    candidate !== null &&
    mine.some(
      (r) =>
        r.id !== relation?.id &&
        r.tipo === candidate.tipo &&
        ((candidate.hacia &&
          ((r.desde === candidate.desde && r.hacia === candidate.hacia) ||
            (undirected && r.desde === candidate.hacia && r.hacia === candidate.desde))) ||
          (candidate.haciaBloque &&
            r.desde === candidate.desde &&
            r.haciaBloque?.titulo === candidate.haciaBloque.titulo &&
            r.haciaBloque.capitulo === candidate.haciaBloque.capitulo)),
    )

  const save = async () => {
    if (!user || !candidate || duplicate) return
    setSaving(true)
    setError(false)
    try {
      if (relation) {
        await whenSaved(updateRelation(relation.id, candidate))
        track('relation_update', { article_id: candidate.desde })
      } else {
        await whenSaved(createRelation(user.uid, candidate))
        track('relation_create', { article_id: candidate.desde })
      }
      onClose()
    } catch {
      setError(true)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={relation ? 'Editar relación' : 'Agregar relación'}
      closeLabel="Cancelar"
      actions={
        <Button
          variant="filled"
          icon="check"
          onClick={() => void save()}
          disabled={!candidate || duplicate || saving}
        >
          Guardar
        </Button>
      }
    >
      <p className={styles.lead}>
        Desde <strong className={styles.anchor}>{articleLabel(anchor)}</strong>
        {anchor.epigrafe ? ` · ${anchor.epigrafe}` : ''}
      </p>

      <fieldset className={styles.fieldset}>
        <legend className={styles.legend}>Se relaciona con</legend>
        <label className={styles.radio}>
          <input
            type="radio"
            name={`${id}-destino`}
            checked={form.target === 'articulo'}
            onChange={() => update({ target: 'articulo' })}
          />
          Otro artículo
        </label>
        <label className={styles.radio}>
          <input
            type="radio"
            name={`${id}-destino`}
            checked={form.target === 'capitulo'}
            onChange={() => update({ target: 'capitulo' })}
          />
          Un capítulo completo
        </label>
      </fieldset>

      {form.target === 'articulo' ? (
        <div className={styles.group}>
          {other ? (
            <div className={styles.selected}>
              <span>
                <span className={styles.selectedLabel}>{articleShortLabel(other)}</span>{' '}
                {other.epigrafe ?? 'Sin epígrafe'}
              </span>
              <Button variant="text" onClick={() => update({ otherId: null })}>
                Cambiar
              </Button>
            </div>
          ) : (
            <>
              <TextField
                label="Buscar artículo"
                type="search"
                leadingIcon="search"
                value={query}
                autoComplete="off"
                supportingText="Escribe un número, como 47 o T23, o una palabra del epígrafe."
                onChange={(event) => setQuery(event.target.value)}
              />
              {results.length > 0 && (
                <ul className={styles.results} aria-label="Resultados">
                  {results.map((article) => (
                    <li key={article.id}>
                      <button
                        type="button"
                        className={styles.result}
                        onClick={() => {
                          update({ otherId: article.id })
                          setQuery('')
                        }}
                      >
                        <span className={styles.selectedLabel}>{articleShortLabel(article)}</span>
                        <span>{article.epigrafe ?? 'Sin epígrafe'}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </div>
      ) : (
        <label className={styles.selectField}>
          <span className={styles.legend}>Capítulo</span>
          <select
            className={styles.select}
            value={form.block}
            onChange={(event) => update({ block: event.target.value })}
          >
            <option value="">Elige un capítulo</option>
            {blocks.map((block) => (
              <option key={block.value} value={block.value}>
                {block.label}
              </option>
            ))}
          </select>
        </label>
      )}

      <fieldset className={styles.fieldset}>
        <legend className={styles.legend}>Tipo de relación</legend>
        {RELATION_TYPES.map((tipo) => (
          <label key={tipo} className={styles.option}>
            <input
              type="radio"
              name={`${id}-tipo`}
              checked={form.tipo === tipo}
              onChange={() => update({ tipo })}
            />
            <span>
              <span className={styles.optionLabel}>{relationTypeLabel(tipo)}</span>
              <span className={styles.optionHelp}>{definitions[tipo]}</span>
            </span>
          </label>
        ))}
      </fieldset>

      {form.target === 'articulo' && !undirected && (
        <fieldset className={styles.fieldset}>
          <legend className={styles.legend}>Dirección</legend>
          <label className={styles.radio}>
            <input
              type="radio"
              name={`${id}-direccion`}
              checked={form.direction === 'saliente'}
              onChange={() => update({ direction: 'saliente' })}
            />
            {articleShortLabel(anchor)} → {other ? articleShortLabel(other) : 'el otro artículo'}
          </label>
          <label className={styles.radio}>
            <input
              type="radio"
              name={`${id}-direccion`}
              checked={form.direction === 'entrante'}
              onChange={() => update({ direction: 'entrante' })}
            />
            {other ? articleShortLabel(other) : 'El otro artículo'} → {articleShortLabel(anchor)}
          </label>
        </fieldset>
      )}

      <div className={styles.selectField}>
        <label htmlFor={`${id}-nota`} className={styles.legend}>
          Nota (opcional)
        </label>
        <textarea
          id={`${id}-nota`}
          className={styles.textarea}
          value={form.nota}
          maxLength={RELATION_NOTE_MAX_LENGTH}
          rows={3}
          placeholder="Por qué se relacionan, en tus palabras."
          onChange={(event) => update({ nota: event.target.value })}
        />
        <span className={styles.counter} aria-hidden="true">
          {form.nota.length}/{RELATION_NOTE_MAX_LENGTH}
        </span>
      </div>

      {duplicate && (
        <p role="alert" className={styles.error}>
          <Icon name="error" size="small" />
          Ya tienes esta misma relación. Cambia el destino o el tipo.
        </p>
      )}
      {error && (
        <p role="alert" className={styles.error}>
          <Icon name="error" size="small" />
          No se pudo guardar. Revisa tu conexión e intenta de nuevo.
        </p>
      )}
    </Dialog>
  )
}
