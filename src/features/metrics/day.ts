const GUATEMALA_DAY = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'America/Guatemala',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

/** Fecha "yyyy-mm-dd" en la zona America/Guatemala. */
export function dayInGuatemala(date: Date = new Date()): string {
  return GUATEMALA_DAY.format(date)
}
