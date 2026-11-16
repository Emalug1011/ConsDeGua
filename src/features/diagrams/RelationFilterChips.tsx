import { Chip } from '../../ui/Chip'
import styles from './RelationFilterChips.module.css'
import { RELATION_TYPE_LABELS, REVIEW_LABELS } from './relationLabels'
import type { RelationFilters } from './relationGraph'

interface RelationFilterChipsProps {
  filters: RelationFilters
  onChange: (filters: RelationFilters) => void
}

function toggle(set: ReadonlySet<string>, value: string): Set<string> {
  const next = new Set(set)
  if (next.has(value)) next.delete(value)
  else next.add(value)
  return next
}

/** Filtros del mapa por tipo de relación y por cotejo. */
export function RelationFilterChips({ filters, onChange }: RelationFilterChipsProps) {
  return (
    <div className={styles.filters}>
      <div role="group" aria-labelledby="filtro-tipo" className={styles.group}>
        <span id="filtro-tipo" className={styles.legend}>
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
      <div role="group" aria-labelledby="filtro-cotejo" className={styles.group}>
        <span id="filtro-cotejo" className={styles.legend}>
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
