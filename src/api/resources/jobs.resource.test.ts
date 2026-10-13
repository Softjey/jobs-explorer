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
})
