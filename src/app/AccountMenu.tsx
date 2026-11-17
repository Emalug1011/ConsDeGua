import { useEffect, useId, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router'
import { signOutUser } from '../features/auth/service'
import { useAuth } from '../features/auth/useAuth'
import { Icon } from '../ui/Icon'
import styles from './AccountMenu.module.css'

/** Foto de la persona en la barra superior; abre su menú de cuenta. */
export function AccountMenu() {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [photoFailed, setPhotoFailed] = useState(false)
  const panelId = useId()
  const container = useRef<HTMLDivElement>(null)
  const button = useRef<HTMLButtonElement>(null)
  const location = useLocation()

  // Cierra al cambiar de página.
  const [lastPath, setLastPath] = useState(location.pathname)
  if (lastPath !== location.pathname) {
    setLastPath(location.pathname)
    setOpen(false)
  }

  useEffect(() => {
    if (!open) return
    const onPointerDown = (event: PointerEvent) => {
      if (!container.current?.contains(event.target as Node)) setOpen(false)
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
        button.current?.focus()
      }
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  if (!user) return null
  const name = user.displayName ?? user.email ?? 'Tu cuenta'
  const initial = name.trim().charAt(0).toUpperCase()
  const showPhoto = Boolean(user.photoURL) && !photoFailed

  return (
    <div ref={container} className={styles.container}>
      <button
        ref={button}
        type="button"
        className={styles.avatarButton}
        aria-expanded={open}
        aria-controls={panelId}
        aria-label="Abrir menú de tu cuenta"
        onClick={() => setOpen((value) => !value)}
      >
        {showPhoto ? (
          <img
            src={user.photoURL ?? undefined}
            alt=""
            className={styles.avatar}
            referrerPolicy="no-referrer"
            onError={() => setPhotoFailed(true)}
          />
        ) : (
          <span className={`${styles.avatar} ${styles.initial}`} aria-hidden="true">
            {initial}
          </span>
        )}
      </button>

      {open && (
        <div id={panelId} className={styles.panel}>
          <div className={styles.identity}>
            <p className={styles.name}>{name}</p>
            {user.email && <p className={styles.email}>{user.email}</p>}
          </div>
          <nav aria-label="Tu cuenta">
            <ul className={styles.items}>
              <li>
                <Link to="/apuntes" className={styles.item}>
                  <Icon name="edit_note" />
                  Mis apuntes
                </Link>
              </li>
              <li>
                <Link to="/ajustes" className={styles.item}>
                  <Icon name="settings" />
                  Ajustes
                </Link>
              </li>
              <li>
                <button type="button" className={styles.item} onClick={() => void signOutUser()}>
                  <Icon name="logout" />
                  Cerrar sesión
                </button>
              </li>
            </ul>
          </nav>
        </div>
      )}
    </div>
  )
}
