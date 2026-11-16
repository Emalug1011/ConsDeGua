import type { RouteObject } from 'react-router'
import { ArticlePage } from '../features/constitution/ArticlePage'
import { CatalogPage } from '../features/constitution/CatalogPage'
import { AppLayout } from './AppLayout'
import { NotFoundPage } from './NotFoundPage'
import { RouteError } from './RouteError'

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <AppLayout />,
    errorElement: <RouteError />,
    children: [
      { index: true, element: <CatalogPage /> },
      { path: 'articulo/:id', element: <ArticlePage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]
