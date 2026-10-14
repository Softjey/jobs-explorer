import { http, HttpResponse } from 'msw'
import list from '@/test/fixtures/list.json'
import { server } from '@/test/server'
import { ApiError } from '../api-error'
import { api } from '../api'

describe('JobsResource', () => {
  it('getMany returns a page of job summaries', async () => {
    const page = await api.jobs.getMany({ pageNum: 0, pageSize: 3 })
    expect(page.total).toBe(list.data.total)
    expect(page.items).toHaveLength(3)
    expect(page.items[0]?.workAssignmentName).toBe('Stammdatenerfassung')
  })

  it('getMany sends pageNum and pageSize', async () => {
    let url = ''
    server.use(
      http.get('*/list', ({ request }) => {
        url = request.url
        return HttpResponse.json(list)
      }),
    )
    await api.jobs.getMany({ pageNum: 2, pageSize: 30 })
    expect(new URL(url).searchParams.get('pageNum')).toBe('2')
    expect(new URL(url).searchParams.get('pageSize')).toBe('30')
  })

  it('getOne returns job details', async () => {
    const job = await api.jobs.getOne('3b9d71a8-f900-496b-b0d0-433d587fbe04')
    expect(job.shiftsCount).toBe(14)
  })

  it('getOne rejects with a 404 http error for an unknown job', async () => {
    await expect(api.jobs.getOne('00000000-0000-4000-8000-000000000000')).rejects.toSatisfy(
      (e) => e instanceof ApiError && e.kind === 'http' && e.status === 404,
    )
  })

  it('getMany rejects with a server error', async () => {
    server.use(http.get('*/list', () => HttpResponse.json({ error: true }, { status: 500 })))
    await expect(api.jobs.getMany({ pageNum: 0, pageSize: 30 })).rejects.toSatisfy(
      (e) => e instanceof ApiError && e.kind === 'http' && e.status === 500,
    )
  })

  it('getMany rejects with a network error', async () => {
    server.use(http.get('*/list', () => HttpResponse.error()))
    await expect(api.jobs.getMany({ pageNum: 0, pageSize: 30 })).rejects.toSatisfy(
      (e) => e instanceof ApiError && e.kind === 'network',
    )
  })

  it('getMany rejects with a schema error when an item is malformed', async () => {
    const broken = { ...list, data: { ...list.data, items: [{ workAssignmentId: 1 }] } }
    server.use(http.get('*/list', () => HttpResponse.json(broken)))
    await expect(api.jobs.getMany({ pageNum: 0, pageSize: 30 })).rejects.toSatisfy(
      (e) => e instanceof ApiError && e.kind === 'schema',
    )
  })

  it('getOne rejects with a schema error when data is missing', async () => {
    server.use(http.get('*/:id', () => HttpResponse.json({ status: 200, error: false })))
    await expect(api.jobs.getOne('3b9d71a8-f900-496b-b0d0-433d587fbe04')).rejects.toSatisfy(
      (e) => e instanceof ApiError && e.kind === 'schema',
    )
  })

  it.each([
    [
      'getMany',
      () => api.jobs.getMany({ pageNum: 0, pageSize: 30 }, { signal: AbortSignal.abort() }),
    ],
    [
      'getOne',
      () =>
        api.jobs.getOne('3b9d71a8-f900-496b-b0d0-433d587fbe04', { signal: AbortSignal.abort() }),
    ],
  ])('%s passes the abort signal to the request', async (_, request) => {
    await expect(request()).rejects.toSatisfy(
      (e) => !(e instanceof ApiError) && (e as Error).name === 'AbortError',
    )
  })
})
