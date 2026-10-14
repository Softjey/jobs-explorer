import { renderHook, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import details from '@/test/fixtures/details.json'
import list from '@/test/fixtures/list.json'
import { createTestQueryClient, createWrapper } from '@/test/query-wrapper'
import { listPage, server } from '@/test/server'
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

  it('does not refetch the loaded pages when the list mounts again', async () => {
    let requests = 0
    server.use(
      http.get('*/list', () => {
        requests += 1
        return HttpResponse.json(list)
      }),
    )
    const wrapper = createWrapper()
    const first = renderHook(() => useJobs(), { wrapper })
    await waitFor(() => {
      expect(first.result.current.isSuccess).toBe(true)
    })
    first.unmount()

    const second = renderHook(() => useJobs(), { wrapper })
    expect(second.result.current.isSuccess).toBe(true)
    await new Promise((resolve) => setTimeout(resolve, 50))
    expect(requests).toBe(1)
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
        const pageNum = new URL(request.url).searchParams.get('pageNum') ?? ''
        pages.push(pageNum)
        return HttpResponse.json(listPage(Number(pageNum)))
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

  it('shows a job only once when it shifts onto the next page', async () => {
    const [shifted] = list.data.items
    server.use(
      http.get('*/list', ({ request }) => {
        if (new URL(request.url).searchParams.get('pageNum') === '0') return HttpResponse.json(list)
        const page = listPage(1)
        const items = [shifted, ...page.data.items.slice(1)]
        return HttpResponse.json({ ...page, data: { ...page.data, items } })
      }),
    )
    const { result } = renderHook(() => useJobs(), { wrapper: createWrapper() })
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })
    await result.current.fetchNextPage()
    await waitFor(() => {
      expect(result.current.isFetchingNextPage).toBe(false)
    })
    const ids = result.current.jobs.map((job) => job.workAssignmentId)
    expect(ids).toHaveLength(5)
    expect(new Set(ids).size).toBe(5)
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

describe('cancellation', () => {
  it.each([
    ['useJobs', '*/list', (): unknown => useJobs()],
    [
      'useJob',
      `*/${details.data.workAssignmentId}`,
      (): unknown => useJob(details.data.workAssignmentId),
    ],
  ])('%s aborts the request when the query is cancelled', async (_, path, hook) => {
    let signal: AbortSignal | undefined
    server.use(
      http.get(path, ({ request }) => {
        signal = request.signal
        return new Promise<never>(() => undefined)
      }),
    )
    const client = createTestQueryClient()
    renderHook(hook, { wrapper: createWrapper(client) })
    await waitFor(() => {
      expect(signal).toBeDefined()
    })
    await client.cancelQueries()
    await waitFor(() => {
      expect(signal?.aborted).toBe(true)
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
