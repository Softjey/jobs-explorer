export type ApiErrorKind = 'network' | 'http' | 'schema'

interface ApiErrorOptions {
  status?: number
  errorCode?: string
  errorId?: number
  cause?: unknown
}

export class ApiError extends Error {
  readonly kind: ApiErrorKind
  readonly status?: number
  readonly errorCode?: string
  readonly errorId?: number

  constructor(kind: ApiErrorKind, message: string, options: ApiErrorOptions = {}) {
    super(message, { cause: options.cause })
    this.name = 'ApiError'
    this.kind = kind
    if (options.status !== undefined) this.status = options.status
    if (options.errorCode !== undefined) this.errorCode = options.errorCode
    if (options.errorId !== undefined) this.errorId = options.errorId
  }
}
