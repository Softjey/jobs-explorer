import type { QueryClient } from '@tanstack/react-query'
import { createRootRouteWithContext, Outlet } from '@tanstack/react-router'
import { AppHeader } from '@/components/common/AppHeader'
import { ErrorState } from '@/components/common/ErrorState'
import { NotFoundPage } from '@/pages/not-found/NotFoundPage'

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  component: () => (
    <>
      <AppHeader />
      <Outlet />
    </>
  ),
  notFoundComponent: () => <NotFoundPage />,
  errorComponent: ({ reset }) => (
    <main className="mx-auto max-w-3xl px-6 pt-8">
      <ErrorState title="Something went wrong" onRetry={reset} />
    </main>
  ),
})
