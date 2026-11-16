import { IconButton } from '../ui/IconButton'
import { useTheme } from './useTheme'

/** Alterna entre modo claro y modo oscuro. */
export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const toDark = theme === 'light'
  return (
    <IconButton
      icon={toDark ? 'dark_mode' : 'light_mode'}
      label={toDark ? 'Cambiar a modo oscuro' : 'Cambiar a modo claro'}
      onClick={toggleTheme}
    />
  )
}
