import { z } from 'zod'
import { ApiError } from './api-error'

const envelopeSchema = z.object({
  status: z.number().optional(),
  data: z.unknown().optional(),
  error: z.boolean().optional(),
  errorCode: z.string().optional(),
  errorId: z.number().optional(),
})

export class HttpClient {
  constructor(private readonly baseUrl: string) {}

  async request<T>(path: string, schema: z.ZodType<T>): Promise<T> {
    const url = new URL(`${this.baseUrl}${path}`, globalThis.location.origin)

    let response: Response
    try {
      response = await fetch(url, { headers: { Accept: 'application/json' } })
    } catch (cause) {
      throw new ApiError('network', 'Network request failed', { cause })
    }

    const body: unknown = await response.json().catch(() => undefined)
    const envelope = envelopeSchema.safeParse(body)
    const meta = envelope.success ? envelope.data : {}

    if (!response.ok || meta.error === true) {
      throw new ApiError('http', `Request failed with status ${meta.status ?? response.status}`, {
        status: response.ok ? (meta.status ?? response.status) : response.status,
        ...(meta.errorCode !== undefined && { errorCode: meta.errorCode }),
        ...(meta.errorId !== undefined && { errorId: meta.errorId }),
      })
    }

    const data = schema.safeParse(meta.data)
    if (!data.success) {
      throw new ApiError('schema', 'Response does not match the expected schema', {
        cause: data.error,
      })
    }
    return data.data
  }
}
