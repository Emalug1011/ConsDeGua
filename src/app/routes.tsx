import type { RouteObject } from 'react-router'
import { LoginPage } from '../features/auth/LoginPage'
import { LOGIN_PATH } from '../features/auth/paths'
import { RequireAuth } from '../features/auth/RequireAuth'
import { ArticlePage } from '../features/constitution/ArticlePage'
import { CatalogPage } from '../features/constitution/CatalogPage'
import { RelationMapPage } from '../features/diagrams/RelationMapPage'
import { NotesPage } from '../features/notes/NotesPage'
import { SettingsPage } from '../features/settings/SettingsPage'
import { AppLayout } from './AppLayout'
import { NotFoundPage } from './NotFoundPage'
import { PublicLayout } from './PublicLayout'
import { RouteError } from './RouteError'

export const routes: RouteObject[] = [
  {
    element: <PublicLayout />,
    errorElement: <RouteError />,
    children: [{ path: LOGIN_PATH, element: <LoginPage /> }],
  },
  {
    path: '/',
    element: <RequireAuth />,
    errorElement: <RouteError />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { index: true, element: <CatalogPage /> },
          { path: 'articulo/:id', element: <ArticlePage /> },
          { path: 'relaciones/:id', element: <RelationMapPage /> },
          { path: 'apuntes', element: <NotesPage /> },
          { path: 'ajustes', element: <SettingsPage /> },
          { path: '*', element: <NotFoundPage /> },
        ],
      },
    ],
  },
]
