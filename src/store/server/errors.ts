import { ApiError } from '@/api/api-error'

/** The API answered 404: the requested object does not exist. */
export function isNotFoundError(error: unknown): boolean {
  return error instanceof ApiError && error.kind === 'http' && error.status === 404
}
