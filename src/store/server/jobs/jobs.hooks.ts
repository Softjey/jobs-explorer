import { useInfiniteQuery, useQuery, useQueryClient } from '@tanstack/react-query'
import type { JobPreview, JobSummary } from '@/entities/job'
import { jobQueryOptions, jobsInfiniteQueryOptions } from './jobs.queries'

export function useJobs() {
  const query = useInfiniteQuery(jobsInfiniteQueryOptions())
  const jobs: JobSummary[] = query.data?.pages.flatMap((page) => page.items) ?? []
  const total = query.data?.pages[0]?.total ?? 0
  return {
    jobs,
    total,
    isPending: query.isPending,
    isError: query.isError,
    refetch: query.refetch,
    hasNextPage: query.hasNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
    isFetchNextPageError: query.isFetchNextPageError,
    fetchNextPage: query.fetchNextPage,
    isSuccess: query.isSuccess,
  }
}

export function useJob(id: string) {
  return useQuery(jobQueryOptions(id))
}

/** Job header data taken from the list cache, so details can render before the request ends. */
export function useJobPreview(id: string): JobPreview | undefined {
  const client = useQueryClient()
  const cached = client.getQueryData(jobsInfiniteQueryOptions().queryKey)
  return cached?.pages.flatMap((page) => page.items).find((job) => job.workAssignmentId === id)
}
