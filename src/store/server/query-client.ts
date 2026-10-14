import { QueryClient } from '@tanstack/react-query'
import { ApiError } from '@/api/api-error'

const STALE_TIME_MS = 5 * 60 * 1000
const MAX_RETRIES = 2

/** A retry cannot help when the response shape is wrong or the request itself was rejected (4xx). */
function isPermanent(error: unknown): boolean {
  if (!(error instanceof ApiError)) return false
  if (error.kind === 'schema') return true
  return error.status !== undefined && error.status >= 400 && error.status < 500
}

export function shouldRetry(failureCount: number, error: unknown): boolean {
  return !isPermanent(error) && failureCount < MAX_RETRIES
}

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: { queries: { staleTime: STALE_TIME_MS, retry: shouldRetry } },
  })
}
