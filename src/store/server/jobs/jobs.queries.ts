import { infiniteQueryOptions, queryOptions } from '@tanstack/react-query'
import { api } from '@/api/api'
import { jobsKeys } from './jobs.keys'

export const JOBS_PAGE_SIZE = 30

export const jobsInfiniteQueryOptions = () =>
  infiniteQueryOptions({
    queryKey: jobsKeys.list(),
    queryFn: ({ pageParam }) => api.jobs.getMany({ pageNum: pageParam, pageSize: JOBS_PAGE_SIZE }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      const loaded = allPages.reduce((sum, page) => sum + page.items.length, 0)
      return lastPage.items.length > 0 && loaded < lastPage.total ? allPages.length : undefined
    },
  })

export const jobQueryOptions = (id: string) =>
  queryOptions({
    queryKey: jobsKeys.detail(id),
    queryFn: () => api.jobs.getOne(id),
  })
