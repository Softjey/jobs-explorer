import { useInfiniteQuery, useQuery, useQueryClient } from '@tanstack/react-query'
import type { JobId, JobPreview, JobSummary } from '@/entities/job'
import type { Paginated } from '@/entities/pagination'
import { jobQueryOptions, jobsInfiniteQueryOptions } from './jobs.queries'

/**
 * Pages are fetched by offset, so a job published meanwhile shifts others onto the next page.
 * The first copy of each job wins.
 */
function allJobsOf(pages: Paginated<JobSummary>[] | undefined): JobSummary[] {
  const jobs = new Map<JobId, JobSummary>()
  for (const job of pages?.flatMap((page) => page.items) ?? []) {
    if (!jobs.has(job.workAssignmentId)) jobs.set(job.workAssignmentId, job)
  }
  return [...jobs.values()]
}

/** Jobs list with page-by-page loading. `total` is the number of jobs on the server. */
export function useJobs() {
  const query = useInfiniteQuery(jobsInfiniteQueryOptions())
  const pages = query.data?.pages

  return {
    jobs: allJobsOf(pages),
    total: pages?.[0]?.total ?? 0,
    isPending: query.isPending,
    isError: query.isError,
    isSuccess: query.isSuccess,
    refetch: query.refetch,
    hasNextPage: query.hasNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
    isFetchNextPageError: query.isFetchNextPageError,
    fetchNextPage: query.fetchNextPage,
  }
}

/** Full details of one job. */
export function useJob(id: JobId) {
  return useQuery(jobQueryOptions(id))
}

/**
 * The job as the list already knows it, or `undefined` if the list was never loaded.
 * Lets the details page show a header before the details request finishes.
 */
export function useJobPreview(id: JobId): JobPreview | undefined {
  const queryClient = useQueryClient()
  const cachedList = queryClient.getQueryData(jobsInfiniteQueryOptions().queryKey)

  return allJobsOf(cachedList?.pages).find((job) => job.workAssignmentId === id)
}
