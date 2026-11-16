import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router/dom'
import { APP_NAME } from '../config/app'
import { AuthProvider } from '../features/auth/AuthProvider'
import '../styles/base.css'
import { router } from './router'
import { applyStoredTheme } from './theme'

const rootElement = document.getElementById('root')
if (!rootElement) throw new Error('No se encontró el elemento #root.')

document.title = APP_NAME
applyStoredTheme()

createRoot(rootElement).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </StrictMode>,
)
