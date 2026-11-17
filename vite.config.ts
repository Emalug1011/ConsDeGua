import react from '@vitejs/plugin-react'
import { execSync } from 'node:child_process'
import { VitePWA } from 'vite-plugin-pwa'
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
  plugins: [
    react(),
    // PWA: instalable en Android y la Constitución disponible sin internet.
    VitePWA({
      // La app avisa cuando hay versión nueva y la persona decide cuándo actualizar.
      registerType: 'prompt',
      injectRegister: false,
      includeAssets: ['favicon.svg'],
      manifest: {
        id: '/',
        name: 'ConstGua',
        short_name: 'ConstGua',
        description: 'Estudia la Constitución Política de la República de Guatemala.',
        lang: 'es-GT',
        dir: 'ltr',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'any',
        // Color de fondo del tema claro (token --surface).
        background_color: '#f8f9ff',
        theme_color: '#f8f9ff',
        categories: ['education', 'books'],
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          {
            src: '/icons/icon-maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
        shortcuts: [
          {
            name: 'Mis apuntes',
            url: '/apuntes',
            icons: [{ src: '/icons/icon-192.png', sizes: '192x192' }],
          },
          {
            name: 'Ajustes',
            url: '/ajustes',
            icons: [{ src: '/icons/icon-192.png', sizes: '192x192' }],
          },
        ],
      },
      workbox: {
        // App completa en caché, incluido el catálogo de artículos (va dentro del JS).
        globPatterns: ['**/*.{js,css,html,svg,png,webmanifest}'],
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
        navigateFallback: '/index.html',
        // Las rutas internas de Firebase (inicio de sesión) nunca salen de la caché.
        navigateFallbackDenylist: [/^\/__\//],
        cleanupOutdatedCaches: true,
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\//,
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'google-fonts-css' },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\//,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts',
              expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
  // Versión visible en el pie de página, para saber qué está cargando cada dispositivo.
  define: {
    __APP_VERSION__: JSON.stringify(commitHash()),
    __BUILD_TIME__: JSON.stringify(buildTime()),
  },
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.{ts,tsx}'],
    setupFiles: ['./src/test/setup.ts'],
    // Varias pruebas dibujan la app completa (índice de 308 artículos, editor bajo
    // demanda); en la corrida completa, con todo en paralelo, tardan más.
    testTimeout: 20000,
  },
})
