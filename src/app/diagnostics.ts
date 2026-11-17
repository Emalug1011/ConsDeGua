const PARAM = 'diagnostico'
const STORAGE_KEY = 'constgua:diagnostico'

/** Se activa con ?diagnostico=1 y sigue activo en la pestaña hasta cerrarla. */
export function diagnosticsEnabled(): boolean {
  try {
    if (new URLSearchParams(window.location.search).get(PARAM) === '1') {
      sessionStorage.setItem(STORAGE_KEY, '1')
    }
    return sessionStorage.getItem(STORAGE_KEY) === '1'
  } catch {
    return false
  }
}
