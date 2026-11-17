/** Ajustes de la persona guardados en `users/{uid}`. */
export interface UserSettings {
  /** Si está activado, se recuerda el último artículo que abrió. */
  rememberReading: boolean
  lastArticleId: string | null
  lastReadAt: Date | null
}

export const DEFAULT_SETTINGS: UserSettings = {
  rememberReading: false,
  lastArticleId: null,
  lastReadAt: null,
}
