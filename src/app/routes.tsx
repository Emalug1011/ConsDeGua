import type { RouteObject } from 'react-router'
import { LoginPage } from '../features/auth/LoginPage'
import { LOGIN_PATH } from '../features/auth/paths'
import { RequireAuth } from '../features/auth/RequireAuth'
import { ArticlePage } from '../features/constitution/ArticlePage'
import { CatalogPage } from '../features/constitution/CatalogPage'
import { RelationMapPage } from '../features/diagrams/RelationMapPage'
import { AppLayout } from './AppLayout'
import { NotFoundPage } from './NotFoundPage'
import { RouteError } from './RouteError'

export const routes: RouteObject[] = [
  { path: LOGIN_PATH, element: <LoginPage />, errorElement: <RouteError /> },
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
          { path: '*', element: <NotFoundPage /> },
        ],
      },
    ],
  },
]
