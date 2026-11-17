import react from '@vitejs/plugin-react'
import { execSync } from 'node:child_process'
import { defineConfig } from 'vitest/config'

/** Commit desde el que se compila; "local" si no hay git. */
function commitHash(): string {
  try {
    return execSync('git rev-parse --short HEAD').toString().trim()
  } catch {
    return 'local'
  }
}

/** Fecha y hora de compilación en Guatemala, por ejemplo "17/11 08:30". */
function buildTime(): string {
  return new Intl.DateTimeFormat('es-GT', {
    timeZone: 'America/Guatemala',
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date())
}

export default defineConfig({
  plugins: [react()],
  // Versión visible en el pie de página, para saber qué está cargando cada dispositivo.
  define: {
    __APP_VERSION__: JSON.stringify(commitHash()),
    __BUILD_TIME__: JSON.stringify(buildTime()),
  },
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.{ts,tsx}'],
    setupFiles: ['./src/test/setup.ts'],
    // Algunas pruebas cargan el editor bajo demanda; en la corrida completa tardan más.
    testTimeout: 10000,
  },
})
