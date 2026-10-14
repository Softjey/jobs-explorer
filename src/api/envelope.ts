import { z } from 'zod'
import { ApiError } from './api-error'
import type { HttpResponse } from './http-client'

/** Every Coople response is wrapped as `{ status, data, error, errorCode, errorId }`. */
const envelopeSchema = z.object({
  status: z.number().optional(),
  data: z.unknown().optional(),
  error: z.boolean().optional(),
  errorCode: z.string().optional(),
  errorId: z.number().optional(),
})

export function unwrapEnvelope<T>(response: HttpResponse, dataSchema: z.ZodType<T>): T {
  const parsed = envelopeSchema.safeParse(response.body)
  const envelope = parsed.success ? parsed.data : {}

  if (!response.ok || envelope.error === true) {
    throw new ApiError('http', `Request failed with status ${envelope.status ?? response.status}`, {
      status: response.ok ? (envelope.status ?? response.status) : response.status,
      ...(envelope.errorCode !== undefined && { errorCode: envelope.errorCode }),
      ...(envelope.errorId !== undefined && { errorId: envelope.errorId }),
    })
  }

  const data = dataSchema.safeParse(envelope.data)
  if (!data.success) {
    throw new ApiError('schema', 'Response does not match the expected schema', {
      cause: data.error,
    })
  }
  return data.data
}
