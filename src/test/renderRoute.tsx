import { render } from '@testing-library/react'
import { RouterProvider, createMemoryRouter } from 'react-router'
import { routes } from '../app/routes'
import { AuthProvider } from '../features/auth/AuthProvider'

/** Renderiza la app completa en una ruta, con un router en memoria y la sesión simulada. */
export function renderRoute(path: string) {
  const router = createMemoryRouter(routes, { initialEntries: [path] })
  const result = render(
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>,
  )
  return { ...result, router }
}
