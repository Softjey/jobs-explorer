import { ApiError } from './api-error'

export interface HttpResponse {
  ok: boolean
  status: number
  /** Parsed JSON, or `undefined` when the body is not JSON. */
  body: unknown
}

/** Transport only: knows nothing about the shape of Coople responses. */
export class HttpClient {
  constructor(private readonly baseUrl: string) {}

  async get(path: string): Promise<HttpResponse> {
    const url = new URL(`${this.baseUrl}${path}`, globalThis.location.origin)

    let response: Response
    try {
      response = await fetch(url, { headers: { Accept: 'application/json' } })
    } catch (cause) {
      throw new ApiError('network', 'Network request failed', { cause })
    }

    const body: unknown = await response.json().catch(() => undefined)
    return { ok: response.ok, status: response.status, body }
  }
}
