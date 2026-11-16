import styles from './AppLogo.module.css'
import { BRAND_VIEWBOX, FLAG_STRIPES, QUETZAL_SHAPES as Q } from './brandMark'

interface AppLogoProps {
  size?: 'default' | 'large'
}

/** Logotipo decorativo: siempre va junto al nombre de la app en texto. */
export function AppLogo({ size = 'default' }: AppLogoProps) {
  return (
    <svg
      viewBox={BRAND_VIEWBOX}
      className={`${styles.logo} ${size === 'large' ? styles.large : ''}`}
      aria-hidden="true"
      focusable="false"
    >
      {FLAG_STRIPES.map((stripe) => (
        <rect
          key={stripe.x}
          x={stripe.x}
          y={0}
          width={stripe.width}
          height={32}
          className={styles[stripe.color]}
        />
      ))}
      {Q.tailFeathers.map((d) => (
        <path key={d} d={d} className={styles.tail} />
      ))}
      <ellipse {...Q.body} className={styles.green} />
      <path d={Q.crest} className={styles.green} />
      <circle {...Q.head} className={styles.green} />
      <ellipse {...Q.breast} className={styles.red} />
      <path d={Q.beak} className={styles.beak} />
      <circle {...Q.eye} className={styles.eye} />
    </svg>
  )
}
