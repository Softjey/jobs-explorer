import type { QueryClient } from '@tanstack/react-query'
import { createRootRouteWithContext, Outlet, useRouter } from '@tanstack/react-router'
import { AppHeader } from '@/components/common/AppHeader'
import { ErrorState } from '@/components/common/ErrorState'
import { NotFoundPage } from '@/pages/not-found/NotFoundPage'

/** `invalidate` reloads the matched routes and resets this error boundary with them. */
function RootError() {
  const router = useRouter()

  return (
    <main className="mx-auto max-w-3xl px-6 pt-8">
      <ErrorState title="Something went wrong" onRetry={() => void router.invalidate()} />
    </main>
  )
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  component: () => (
    <>
      <AppHeader />
      <Outlet />
    </>
  ),
  notFoundComponent: () => <NotFoundPage />,
  errorComponent: RootError,
})
