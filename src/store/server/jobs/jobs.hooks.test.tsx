import { renderHook, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import details from '@/test/fixtures/details.json'
import list from '@/test/fixtures/list.json'
import { createTestQueryClient, createWrapper } from '@/test/query-wrapper'
import { server } from '@/test/server'
import { jobsInfiniteQueryOptions } from './jobs.queries'
import { useJob, useJobPreview, useJobs } from './jobs.hooks'

describe('useJobs', () => {
  it('loads the first page', async () => {
    const { result } = renderHook(() => useJobs(), { wrapper: createWrapper() })
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })
    expect(result.current.jobs).toHaveLength(3)
    expect(result.current.total).toBe(list.data.total)
    expect(result.current.hasNextPage).toBe(true)
  })

  it('has no next page once everything is loaded', async () => {
    server.use(
      http.get('*/list', () => HttpResponse.json({ ...list, data: { ...list.data, total: 3 } })),
    )
    const { result } = renderHook(() => useJobs(), { wrapper: createWrapper() })
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })
    expect(result.current.hasNextPage).toBe(false)
  })

  it('requests the next page number when fetching more', async () => {
    const pages: string[] = []
    server.use(
      http.get('*/list', ({ request }) => {
        pages.push(new URL(request.url).searchParams.get('pageNum') ?? '')
        return HttpResponse.json(list)
      }),
    )
    const { result } = renderHook(() => useJobs(), { wrapper: createWrapper() })
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })
    await result.current.fetchNextPage()
    await waitFor(() => {
      expect(result.current.jobs).toHaveLength(6)
    })
    expect(pages).toEqual(['0', '1'])
  })

  it('exposes the error when the request fails', async () => {
    server.use(http.get('*/list', () => HttpResponse.json({ error: true }, { status: 500 })))
    const { result } = renderHook(() => useJobs(), { wrapper: createWrapper() })
    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })
  })
})

describe('useJob', () => {
  it('loads job details', async () => {
    const { result } = renderHook(() => useJob(details.data.workAssignmentId), {
      wrapper: createWrapper(),
    })
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })
    expect(result.current.data?.workAssignmentName).toBe('Stammdatenerfassung')
  })

  it('fails with a 404 for an unknown job', async () => {
    const { result } = renderHook(() => useJob('00000000-0000-4000-8000-000000000000'), {
      wrapper: createWrapper(),
    })
    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })
  })
})

describe('useJobPreview', () => {
  it('returns undefined when the job is not in the list cache', () => {
    const { result } = renderHook(() => useJobPreview('x'), { wrapper: createWrapper() })
    expect(result.current).toBeUndefined()
  })

  it('returns the preview from the list cache', async () => {
    const client = createTestQueryClient()
    await client.infiniteQuery(jobsInfiniteQueryOptions())
    const { result } = renderHook(() => useJobPreview(details.data.workAssignmentId), {
      wrapper: createWrapper(client),
    })
    expect(result.current?.workAssignmentName).toBe('Stammdatenerfassung')
  })

  describe('failures', () => {
    it('useJobs reports a network failure', async () => {
      server.use(http.get('*/list', () => HttpResponse.error()))
      const { result } = renderHook(() => useJobs(), { wrapper: createWrapper() })
      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })
      expect(result.current.jobs).toEqual([])
    })

    it('useJobs keeps loaded jobs when the next page fails', async () => {
      let calls = 0
      server.use(
        http.get('*/list', () => {
          calls += 1
          return calls === 1 ? HttpResponse.json(list) : HttpResponse.error()
        }),
      )
      const { result } = renderHook(() => useJobs(), { wrapper: createWrapper() })
      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })
      await result.current.fetchNextPage()
      await waitFor(() => {
        expect(result.current.isFetchNextPageError).toBe(true)
      })
      expect(result.current.jobs).toHaveLength(3)
    })

    it('stops paginating when a page comes back empty', async () => {
      let calls = 0
      server.use(
        http.get('*/list', () => {
          calls += 1
          return HttpResponse.json(
            calls === 1 ? list : { ...list, data: { items: [], total: list.data.total } },
          )
        }),
      )
      const { result } = renderHook(() => useJobs(), { wrapper: createWrapper() })
      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })
      await result.current.fetchNextPage()
      await waitFor(() => {
        expect(result.current.hasNextPage).toBe(false)
      })
    })

    it('useJob fails on a server error', async () => {
      server.use(
        http.get(`*/${details.data.workAssignmentId}`, () =>
          HttpResponse.json({ error: true }, { status: 500 }),
        ),
      )
      const { result } = renderHook(() => useJob(details.data.workAssignmentId), {
        wrapper: createWrapper(),
      })
      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })
      expect(result.current.data).toBeUndefined()
    })
  })
})
