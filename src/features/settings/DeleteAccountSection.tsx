import { useState } from 'react'
import { Link } from 'react-router'
import { useOnline } from '../../app/useOnline'
import { Button } from '../../ui/Button'
import { Dialog } from '../../ui/Dialog'
import { Icon } from '../../ui/Icon'
import { deleteAccount, leaveAfterAccountDeletion } from '../auth/service'
import { DELETE_ACCOUNT_INFO_PATH } from '../legal/paths'
import { track } from '../metrics/track'
import styles from './SettingsPage.module.css'

const ERRORS = {
  popup_blocked:
    'Tu navegador bloqueó la ventana de Google. Permite las ventanas emergentes e intenta de nuevo.',
  wrong_account: 'Elige la misma cuenta de Google con la que ingresaste e intenta de nuevo.',
  failed: 'No se pudo eliminar tu cuenta. Revisa tu conexión e intenta de nuevo.',
} as const

type DeleteError = keyof typeof ERRORS

/** Elimina la cuenta y todos los datos de la persona, después de confirmarlo. */
export function DeleteAccountSection() {
  const online = useOnline()
  const [open, setOpen] = useState(false)
  const [working, setWorking] = useState(false)
  const [error, setError] = useState<DeleteError | null>(null)

  const close = () => {
    if (working) return
    setOpen(false)
    setError(null)
  }

  const confirm = async () => {
    setWorking(true)
    setError(null)
    try {
      const result = await deleteAccount()
      if (result === 'deleted') {
        track('account_delete')
        await leaveAfterAccountDeletion()
        return
      }
      if (result !== 'cancelled') setError(result)
    } catch {
      setError('failed')
    }
    setWorking(false)
  }

  return (
    <section aria-labelledby="ajustes-cuenta" className={styles.section}>
      <h2 id="ajustes-cuenta" className="title-medium">
        Tu cuenta
      </h2>
      <p className={styles.muted}>
        Elimina tu cuenta y todo lo que guardaste: apuntes, relaciones propias y ajustes. No se
        puede deshacer.
      </p>
      {!online && (
        <p className={styles.muted}>Necesitas conexión a internet para eliminar tu cuenta.</p>
      )}
      <div>
        <Button variant="outlined" icon="delete" disabled={!online} onClick={() => setOpen(true)}>
          Eliminar cuenta
        </Button>
      </div>
      <p className={styles.muted}>
        <Link to={DELETE_ACCOUNT_INFO_PATH}>Qué se borra al eliminar tu cuenta</Link>
      </p>

      <Dialog
        open={open}
        onClose={close}
        title="¿Eliminar tu cuenta?"
        closeLabel="Cancelar"
        actions={
          <Button
            variant="filled"
            icon="delete"
            disabled={working || !online}
            onClick={() => void confirm()}
          >
            {working ? 'Eliminando' : 'Eliminar cuenta'}
          </Button>
        }
      >
        <p>Se borrarán para siempre tus apuntes, tus relaciones propias y tus ajustes.</p>
        <p>Google te pedirá que ingreses de nuevo para confirmar que eres tú.</p>
        {error && (
          <p role="alert" className={styles.error}>
            <Icon name="error" size="small" />
            {ERRORS[error]}
          </p>
        )}
      </Dialog>
    </section>
  )
}
