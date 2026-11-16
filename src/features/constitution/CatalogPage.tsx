import { useMemo, useState } from 'react'
import { TextField } from '../../ui/TextField'
import { ArticleList } from './ArticleList'
import { getCatalogInfo, search } from './catalog'
import styles from './CatalogPage.module.css'
import { StructureList } from './StructureList'

const MIN_QUERY_LENGTH = 2
const RESULT_LIMIT = 50

export function CatalogPage() {
  const [query, setQuery] = useState('')
  const { ley } = getCatalogInfo()
  const trimmed = query.trim()
  const searching = trimmed.length >= MIN_QUERY_LENGTH || /^\d$/.test(trimmed)
  const results = useMemo(
    () => (searching ? search(trimmed, RESULT_LIMIT) : []),
    [searching, trimmed],
  )

  return (
    <div className={styles.page}>
      <h1 className="headline-small">{ley}</h1>

      <search className={styles.search}>
        <TextField
          label="Buscar artículo"
          type="search"
          leadingIcon="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          supportingText="Escribe un número, como 47 o T23, o una palabra del epígrafe o del texto."
          autoComplete="off"
        />
      </search>

      {searching ? (
        <section aria-labelledby="resultados" className={styles.results}>
          <h2 id="resultados" className="title-medium">
            {results.length === 0
              ? 'Sin resultados'
              : `${results.length}${results.length === RESULT_LIMIT ? ' o más' : ''} resultados`}
          </h2>
          {results.length === 0 ? (
            <p className={styles.empty}>Prueba con otra palabra o con el número del artículo.</p>
          ) : (
            <ArticleList articles={results} />
          )}
        </section>
      ) : (
        <StructureList />
      )}
    </div>
  )
}
