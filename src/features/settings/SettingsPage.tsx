import { useState } from 'react'
import { Link } from 'react-router'
import { useTheme } from '../../app/useTheme'
import { whenSaved } from '../../lib/whenSaved'
import type { ThemePreference } from '../../app/theme'
import { Icon } from '../../ui/Icon'
import { Switch } from '../../ui/Switch'
import { useAuth } from '../auth/useAuth'
import { getArticle } from '../constitution/catalog'
import { articleLabel } from '../constitution/format'
import { setRememberReading } from './service'
import { DeleteAccountSection } from './DeleteAccountSection'
import { InstallAppSection } from './InstallAppSection'
import styles from './SettingsPage.module.css'
import { useUserSettings } from './useUserSettings'

const THEME_OPTIONS: { value: ThemePreference; label: string }[] = [
  { value: 'system', label: 'Usar el del sistema' },
  { value: 'light', label: 'Claro' },
  { value: 'dark', label: 'Oscuro' },
]

export function SettingsPage() {
  const { user } = useAuth()
  const settings = useUserSettings()
  const { preference, setPreference } = useTheme()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(false)

  const ready = settings.status === 'ready' ? settings.settings : null
  const lastArticle = ready?.lastArticleId ? getArticle(ready.lastArticleId) : undefined

  const toggleReading = async (enabled: boolean) => {
    if (!user) return
    setSaving(true)
    setError(false)
    try {
      await whenSaved(setRememberReading(user.uid, enabled))
    } catch {
      setError(true)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className={styles.page}>
      <h1 className="headline-small">Ajustes</h1>

      <section aria-labelledby="ajustes-lectura" className={styles.section}>
        <h2 id="ajustes-lectura" className="title-medium">
          Lectura
        </h2>
        <Switch
          label="Recordar dónde me quedé leyendo"
          supportingText="Guarda en tu cuenta el último artículo que abriste para que sigas desde el índice. Solo tú lo ves."
          checked={ready?.rememberReading ?? false}
          disabled={!ready || saving}
          onChange={(enabled) => void toggleReading(enabled)}
        />
        {lastArticle && (
          <p className={styles.muted}>
            Último artículo:{' '}
            <Link to={`/articulo/${lastArticle.id}`}>{articleLabel(lastArticle)}</Link>
          </p>
        )}
        {settings.status === 'error' && (
          <p role="alert" className={styles.error}>
            <Icon name="error" size="small" />
            No se pudieron cargar tus ajustes. Revisa tu conexión y recarga la página.
          </p>
        )}
        {error && (
          <p role="alert" className={styles.error}>
            <Icon name="error" size="small" />
            No se pudo guardar el cambio. Revisa tu conexión e intenta de nuevo.
          </p>
        )}
      </section>

      <InstallAppSection />

      <section aria-labelledby="ajustes-apariencia" className={styles.section}>
        <h2 id="ajustes-apariencia" className="title-medium">
          Apariencia
        </h2>
        <fieldset className={styles.fieldset}>
          <legend className={styles.legend}>Tema</legend>
          {THEME_OPTIONS.map((option) => (
            <label key={option.value} className={styles.radio}>
              <input
                type="radio"
                name="tema"
                value={option.value}
                checked={preference === option.value}
                onChange={() => setPreference(option.value)}
              />
              {option.label}
            </label>
          ))}
        </fieldset>
      </section>

      <section aria-labelledby="ajustes-apuntes" className={styles.section}>
        <h2 id="ajustes-apuntes" className="title-medium">
          Apuntes
        </h2>
        <p className={styles.muted}>Tus apuntes son privados: solo tú puedes verlos.</p>
        <Link to="/apuntes" className={styles.link}>
          <Icon name="edit_note" size="small" />
          Ir a mis apuntes
        </Link>
      </section>

      <DeleteAccountSection />
    </div>
  )
}
