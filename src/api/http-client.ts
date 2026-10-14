import { ApiError } from './api-error'

export interface HttpResponse {
  ok: boolean
  status: number
  /** Parsed JSON, or `undefined` when the body is not JSON. */
  body: unknown
}

export interface RequestOptions {
  /** Cancels the request, e.g. when the query that started it is no longer needed. */
  signal?: AbortSignal
}

/** Transport only: knows nothing about the shape of Coople responses. */
export class HttpClient {
  constructor(private readonly baseUrl: string) {}

  async get(path: string, { signal }: RequestOptions = {}): Promise<HttpResponse> {
    const url = new URL(`${this.baseUrl}${path}`, globalThis.location.origin)

    let response: Response
    try {
      response = await fetch(url, { headers: { Accept: 'application/json' }, signal })
    } catch (cause) {
      if (signal?.aborted) throw cause
      throw new ApiError('network', 'Network request failed', { cause })
    }

    const body: unknown = await response.json().catch(() => undefined)
    return { ok: response.ok, status: response.status, body }
  }
}
