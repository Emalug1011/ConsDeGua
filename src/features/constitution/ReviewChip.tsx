import { Chip } from '../../ui/Chip'
import { LITERAL_CITATION } from './catalog'

interface ReviewChipProps {
  cotejo: string
}

/** Todo lo que no sea cita textual se presenta como relación sugerida. */
export function ReviewChip({ cotejo }: ReviewChipProps) {
  return cotejo === LITERAL_CITATION ? (
    <Chip label="Cita textual" icon="format_quote" />
  ) : (
    <Chip label="Relación sugerida" icon="lightbulb" />
  )
}
