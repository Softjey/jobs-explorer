import { http, HttpResponse } from 'msw'
import { server } from '@/test/server'
import { ApiError } from './api-error'
import { HttpClient } from './http-client'

const client = new HttpClient('/api')

describe('HttpClient', () => {
  it('returns status and parsed JSON body', async () => {
    server.use(http.get('*/api/thing', () => HttpResponse.json({ value: 3 }, { status: 201 })))
    await expect(client.get('/thing')).resolves.toEqual({
      ok: true,
      status: 201,
      body: { value: 3 },
    })
  })

  it('returns a failed response instead of throwing', async () => {
    server.use(http.get('*/api/thing', () => HttpResponse.json({ error: true }, { status: 404 })))
    await expect(client.get('/thing')).resolves.toMatchObject({ ok: false, status: 404 })
  })

  it('returns an undefined body when the response is not JSON', async () => {
    server.use(http.get('*/api/thing', () => new HttpResponse('<html>', { status: 200 })))
    await expect(client.get('/thing')).resolves.toMatchObject({ ok: true, body: undefined })
  })

  it('throws a network error when fetch fails', async () => {
    server.use(http.get('*/api/thing', () => HttpResponse.error()))
    await expect(client.get('/thing')).rejects.toSatisfy(
      (e) => e instanceof ApiError && e.kind === 'network',
    )
  })

  it('rethrows an abort as is, not as a network error', async () => {
    server.use(http.get('*/api/thing', () => new Promise<never>(() => undefined)))
    const controller = new AbortController()
    const request = client.get('/thing', { signal: controller.signal })
    controller.abort()
    await expect(request).rejects.toSatisfy(
      (e) => !(e instanceof ApiError) && (e as Error).name === 'AbortError',
    )
  })
})
