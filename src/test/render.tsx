import { QueryClientProvider } from '@tanstack/react-query'
import { createMemoryHistory, createRouter, RouterProvider } from '@tanstack/react-router'
import { render } from '@testing-library/react'
import { routeTree } from '@/routeTree.gen'
import { createTestQueryClient } from './query-wrapper'
import { getScrollRestorationKey } from '@/lib/scroll-restoration'

export async function renderApp(path = '/') {
  const queryClient = createTestQueryClient()
  const router = createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: [path] }),
    context: { queryClient },
    scrollRestoration: true,
    getScrollRestorationKey,
  })
  await router.load()
  const utils = render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  )
  return { ...utils, router, queryClient }
}
