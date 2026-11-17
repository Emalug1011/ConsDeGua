import { useId } from 'react'
import { Chip } from '../../ui/Chip'
import styles from './RelationFilterChips.module.css'
import type { RelationFilters, RelationOrigin } from './relationGraph'
import { ORIGIN_LABELS, RELATION_TYPE_LABELS, REVIEW_LABELS } from './relationLabels'

interface RelationFilterChipsProps {
  filters: RelationFilters
  onChange: (filters: RelationFilters) => void
}

function toggle<T extends string>(set: ReadonlySet<T>, value: T): Set<T> {
  const next = new Set(set)
  if (next.has(value)) next.delete(value)
  else next.add(value)
  return next
}

/** Filtros del mapa por tipo de relación, origen (catálogo o propias) y cotejo. */
export function RelationFilterChips({ filters, onChange }: RelationFilterChipsProps) {
  const id = useId()
  return (
    <div className={styles.filters}>
      <div role="group" aria-labelledby={`${id}-tipo`} className={styles.group}>
        <span id={`${id}-tipo`} className={styles.legend}>
          Tipo de relación
        </span>
        <div className={styles.chips}>
          {Object.entries(RELATION_TYPE_LABELS).map(([tipo, label]) => (
            <Chip
              key={tipo}
              label={label}
              selected={filters.tipos.has(tipo)}
              onClick={() => onChange({ ...filters, tipos: toggle(filters.tipos, tipo) })}
            />
          ))}
        </div>
      </div>
      <div role="group" aria-labelledby={`${id}-origen`} className={styles.group}>
        <span id={`${id}-origen`} className={styles.legend}>
          Origen
        </span>
        <div className={styles.chips}>
          {(Object.entries(ORIGIN_LABELS) as [RelationOrigin, string][]).map(([origen, label]) => (
            <Chip
              key={origen}
              label={label}
              selected={filters.origenes.has(origen)}
              onClick={() => onChange({ ...filters, origenes: toggle(filters.origenes, origen) })}
            />
          ))}
        </div>
      </div>
      <div role="group" aria-labelledby={`${id}-cotejo`} className={styles.group}>
        <span id={`${id}-cotejo`} className={styles.legend}>
          Cotejo
        </span>
        <div className={styles.chips}>
          {Object.entries(REVIEW_LABELS).map(([cotejo, label]) => (
            <Chip
              key={cotejo}
              label={label}
              selected={filters.cotejos.has(cotejo)}
              onClick={() => onChange({ ...filters, cotejos: toggle(filters.cotejos, cotejo) })}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
