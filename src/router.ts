import { createRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'
import { createQueryClient } from '@/store/server/query-client'
import { getScrollRestorationKey } from '@/lib/scroll-restoration'

export const queryClient = createQueryClient()

export const router = createRouter({
  routeTree,
  context: { queryClient },
  defaultPreload: 'intent',
  scrollRestoration: true,
  getScrollRestorationKey,
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
