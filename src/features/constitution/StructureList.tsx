import { ArticleList } from './ArticleList'
import { getStructure } from './catalog'
import styles from './StructureList.module.css'

/** Índice de la Constitución por título, capítulo y sección. */
export function StructureList() {
  const titles = getStructure()

  return (
    <nav aria-label="Índice de la Constitución" className={styles.index}>
      {titles.map((title) => (
        <details key={title.numero} className={styles.title}>
          <summary className={styles.summary}>
            <span className="label-large">Título {title.numero}</span>
            <span className="title-medium">{title.nombre}</span>
          </summary>
          <div className={styles.body}>
            {title.capitulos.map((chapter) => (
              <section key={chapter.numero} className={styles.chapter}>
                <h2 className="title-small">
                  Capítulo {chapter.numero}. {chapter.nombre}
                </h2>
                {chapter.articulos.length > 0 && <ArticleList articles={chapter.articulos} />}
                {chapter.secciones.map((section) => (
                  <section key={section.numero} className={styles.section}>
                    <h3 className={styles.sectionHeading}>
                      Sección {section.numero}. {section.nombre}
                    </h3>
                    <ArticleList articles={section.articulos} />
                  </section>
                ))}
              </section>
            ))}
          </div>
        </details>
      ))}
    </nav>
  )
}
