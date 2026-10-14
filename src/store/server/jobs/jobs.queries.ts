import { infiniteQueryOptions, queryOptions } from '@tanstack/react-query'
import { api } from '@/api/api'
import type { JobId, JobSummary } from '@/entities/job'
import type { Paginated } from '@/entities/pagination'
import { jobsKeys } from './jobs.keys'

const PAGE_SIZE = 30
const FIRST_PAGE = 0

/** Pages are numbered from 0, so the next page number equals the count of loaded pages. */
function getNextPageNumber(
  lastPage: Paginated<JobSummary>,
  loadedPages: Paginated<JobSummary>[],
): number | undefined {
  const loadedJobs = loadedPages.reduce((count, page) => count + page.items.length, 0)
  const lastPageWasEmpty = lastPage.items.length === 0
  const hasMoreOnServer = loadedJobs < lastPage.total

  return hasMoreOnServer && !lastPageWasEmpty ? loadedPages.length : undefined
}

/**
 * The jobs list, loaded page by page.
 * Not refetched on mount: coming back from a job would re-request every loaded page in a row.
 */
export const jobsInfiniteQueryOptions = () =>
  infiniteQueryOptions({
    queryKey: jobsKeys.list(),
    queryFn: ({ pageParam, signal }) =>
      api.jobs.getMany({ pageNum: pageParam, pageSize: PAGE_SIZE }, { signal }),
    initialPageParam: FIRST_PAGE,
    getNextPageParam: getNextPageNumber,
    refetchOnMount: false,
  })

/** A single job with all its details. */
export const jobQueryOptions = (id: JobId) =>
  queryOptions({
    queryKey: jobsKeys.detail(id),
    queryFn: ({ signal }) => api.jobs.getOne(id, { signal }),
  })
