import { useEffect, useState } from 'react'
import styles from './DiagnosticsPanel.module.css'

const MAX_LINES = 30

/** Describe un elemento sin datos personales: etiqueta y nombre o texto corto. */
function describe(target: EventTarget | null): string {
  if (!(target instanceof Element)) return String(target)
  const name = target.getAttribute('aria-label') ?? target.textContent ?? ''
  return `${target.tagName.toLowerCase()}${name ? ` "${name.trim().slice(0, 28)}"` : ''}`
}

function time(): string {
  return new Date().toISOString().slice(17, 23)
}

/**
 * Panel de diagnóstico para celulares: muestra toques, aperturas y cierres de
 * diálogos y errores, para encontrar fallas que solo pasan en un dispositivo.
 * No registra contenido de apuntes, correos ni nombres.
 */
export function DiagnosticsPanel() {
  const [lines, setLines] = useState<string[]>([])

  useEffect(() => {
    const add = (line: string) =>
      setLines((current) => [...current.slice(-(MAX_LINES - 1)), `${time()} ${line}`])

    const onEvent = (event: Event) => add(`${event.type} → ${describe(event.target)}`)
    const onError = (event: ErrorEvent) => add(`ERROR ${event.message}`)
    const onRejection = (event: PromiseRejectionEvent) => add(`RECHAZO ${String(event.reason)}`)
    const types = ['pointerdown', 'touchend', 'click', 'close', 'cancel'] as const
    types.forEach((type) => document.addEventListener(type, onEvent, true))
    window.addEventListener('error', onError)
    window.addEventListener('unhandledrejection', onRejection)

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        const dialog = mutation.target
        if (dialog instanceof HTMLDialogElement && mutation.attributeName === 'open') {
          const title = dialog.querySelector('h2')?.textContent ?? ''
          add(`diálogo ${dialog.open ? 'ABIERTO' : 'cerrado'} "${title.slice(0, 28)}"`)
        }
      }
    })
    observer.observe(document.body, { attributes: true, attributeFilter: ['open'], subtree: true })

    add(
      `inicio ${window.innerWidth}×${window.innerHeight} dialog=${typeof HTMLDialogElement} ` +
        `svh=${typeof CSS?.supports === 'function' && CSS.supports('height', '1svh')} | ${navigator.userAgent}`,
    )

    return () => {
      types.forEach((type) => document.removeEventListener(type, onEvent, true))
      window.removeEventListener('error', onError)
      window.removeEventListener('unhandledrejection', onRejection)
      observer.disconnect()
    }
  }, [])

  return (
    <aside className={styles.panel} aria-label="Diagnóstico">
      <p className={styles.heading}>Diagnóstico (toma una captura y envíala)</p>
      <ol className={styles.lines}>
        {lines.map((line, index) => (
          <li key={index}>{line}</li>
        ))}
      </ol>
    </aside>
  )
}
