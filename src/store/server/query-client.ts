import { QueryClient } from '@tanstack/react-query'

const STALE_TIME_MS = 5 * 60 * 1000
const MAX_RETRIES = 2

export function shouldRetry(failureCount: number, error: unknown): boolean {
  if (typeof error === 'object' && error !== null && 'kind' in error && 'status' in error) {
    const status = (error as { status: unknown }).status
    if (typeof status === 'number' && status >= 400 && status < 500) return false
  }
  return failureCount < MAX_RETRIES
}

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: { queries: { staleTime: STALE_TIME_MS, retry: shouldRetry } },
  })
}
