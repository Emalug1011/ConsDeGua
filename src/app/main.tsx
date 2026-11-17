import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router/dom'
import { APP_NAME } from '../config/app'
import { AuthProvider } from '../features/auth/AuthProvider'
import '../styles/base.css'
import { captureInstallPrompt } from './installPrompt'
import { router } from './router'
import { applyStoredTheme } from './theme'
import { UpdatePrompt } from './UpdatePrompt'

const rootElement = document.getElementById('root')
if (!rootElement) throw new Error('No se encontró el elemento #root.')

document.title = APP_NAME
applyStoredTheme()
captureInstallPrompt()

createRoot(rootElement).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
      <UpdatePrompt />
    </AuthProvider>
  </StrictMode>,
)
