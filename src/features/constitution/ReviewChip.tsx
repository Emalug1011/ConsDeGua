import { Chip } from '../../ui/Chip'
import { LITERAL_CITATION, OWN_RELATION } from './catalog'

interface ReviewChipProps {
  cotejo: string
}

/** Todo lo que no sea cita textual se presenta como relación sugerida; las propias, como tuyas. */
export function ReviewChip({ cotejo }: ReviewChipProps) {
  if (cotejo === OWN_RELATION) return <Chip label="Tu relación" icon="person" />
  return cotejo === LITERAL_CITATION ? (
    <Chip label="Cita textual" icon="format_quote" />
  ) : (
    <Chip label="Relación sugerida" icon="lightbulb" />
  )
}
