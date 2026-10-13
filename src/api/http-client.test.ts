import { http, HttpResponse } from 'msw'
import { z } from 'zod'
import { server } from '@/test/server'
import { ApiError } from './api-error'
import { HttpClient } from './http-client'

const schema = z.object({ value: z.number() })
const client = new HttpClient('/api')

function use(...handlers: Parameters<typeof server.use>) {
  server.use(...handlers)
}

async function failure(promise: Promise<unknown>): Promise<ApiError> {
  try {
    await promise
  } catch (e) {
    if (e instanceof ApiError) return e
    throw e
  }
  throw new Error('expected request to fail')
}

describe('HttpClient', () => {
  it('unwraps the envelope and validates data', async () => {
    use(
      http.get('*/api/thing', () =>
        HttpResponse.json({ status: 200, data: { value: 3 }, error: false }),
      ),
    )
    await expect(client.request('/thing', schema)).resolves.toEqual({ value: 3 })
  })

  it('throws a network error when fetch fails', async () => {
    use(http.get('*/api/thing', () => HttpResponse.error()))
    const error = await failure(client.request('/thing', schema))
    expect(error.kind).toBe('network')
  })

  it('throws an http error with status, errorCode and errorId', async () => {
    use(
      http.get('*/api/thing', () =>
        HttpResponse.json(
          { status: 404, error: true, errorCode: 'Object_not_found', errorId: 10004 },
          { status: 404 },
        ),
      ),
    )
    const error = await failure(client.request('/thing', schema))
    expect(error).toMatchObject({
      kind: 'http',
      status: 404,
      errorCode: 'Object_not_found',
      errorId: 10004,
    })
  })

  it('throws an http error when the error body is not JSON', async () => {
    use(http.get('*/api/thing', () => new HttpResponse('Bad gateway', { status: 502 })))
    const error = await failure(client.request('/thing', schema))
    expect(error).toMatchObject({ kind: 'http', status: 502 })
    expect(error.errorCode).toBeUndefined()
  })

  it('throws a schema error when data does not match', async () => {
    use(http.get('*/api/thing', () => HttpResponse.json({ status: 200, data: { value: 'x' } })))
    const error = await failure(client.request('/thing', schema))
    expect(error.kind).toBe('schema')
  })

  it('throws a schema error when a 200 response has no data', async () => {
    use(http.get('*/api/thing', () => HttpResponse.json({ status: 200, error: false })))
    const error = await failure(client.request('/thing', schema))
    expect(error.kind).toBe('schema')
  })

  it('throws a schema error when a 200 response is not JSON', async () => {
    use(http.get('*/api/thing', () => new HttpResponse('<html>', { status: 200 })))
    const error = await failure(client.request('/thing', schema))
    expect(error.kind).toBe('schema')
  })

  it('treats error:true inside a 200 response as an http error', async () => {
    use(
      http.get('*/api/thing', () =>
        HttpResponse.json({ status: 500, error: true, errorCode: 'Boom', errorId: 1 }),
      ),
    )
    const error = await failure(client.request('/thing', schema))
    expect(error).toMatchObject({ kind: 'http', status: 500, errorCode: 'Boom' })
  })
})
