import { useEffect, useRef } from 'react'
import { EmptyState } from '@/components/common/EmptyState'
import { ErrorState } from '@/components/common/ErrorState'
import { JobCardSkeleton } from '@/components/jobs/JobCardSkeleton'
import { JobGrid } from '@/components/jobs/JobList'
import { Button } from '@/components/ui/button'
import { useJobs } from '@/store/server/jobs/jobs.hooks'

const SKELETON_COUNT = 6

export function JobListPage() {
  const {
    jobs,
    total,
    isPending,
    isError,
    refetch,
    hasNextPage,
    isFetchingNextPage,
    isFetchNextPageError,
    fetchNextPage,
  } = useJobs()
  const sentinel = useRef<HTMLDivElement>(null)
  const canLoadMore = hasNextPage && !isFetchingNextPage && !isFetchNextPageError

  useEffect(() => {
    const element = sentinel.current
    if (!element || !canLoadMore) return
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) void fetchNextPage()
    })
    observer.observe(element)
    return () => {
      observer.disconnect()
    }
  }, [canLoadMore, fetchNextPage, jobs.length])

  if (isPending) {
    return (
      <Page>
        <JobGrid jobs={[]}>
          {Array.from({ length: SKELETON_COUNT }, (_, i) => (
            <JobCardSkeleton key={i} />
          ))}
        </JobGrid>
      </Page>
    )
  }

  if (isError && jobs.length === 0) {
    return (
      <Page>
        <ErrorState
          title="Could not load jobs"
          message="Check your connection and try again."
          onRetry={() => void refetch()}
        />
      </Page>
    )
  }

  if (jobs.length === 0) {
    return (
      <Page>
        <EmptyState title="No jobs" />
      </Page>
    )
  }

  return (
    <Page count={`Showing ${jobs.length} of ${total}`}>
      <JobGrid jobs={jobs}>
        {isFetchingNextPage && Array.from({ length: 3 }, (_, i) => <JobCardSkeleton key={i} />)}
      </JobGrid>
      {isFetchNextPageError && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-5 py-4">
          <span className="font-medium text-red-700">Could not load more jobs</span>
          <Button variant="outline" onClick={() => void fetchNextPage()}>
            Retry
          </Button>
        </div>
      )}
      {hasNextPage && <div ref={sentinel} aria-hidden className="h-1" />}
      {!hasNextPage && <p className="mt-8 text-center text-sm text-slate-600">End of list</p>}
    </Page>
  )
}

function Page({ children, count }: { children: React.ReactNode; count?: string }) {
  return (
    <main className="mx-auto max-w-6xl px-6 pt-8 pb-16">
      <div className="mb-6 flex flex-wrap items-baseline justify-between gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Open jobs</h1>
        {count && <span className="text-[15px] text-slate-600">{count}</span>}
      </div>
      {children}
    </main>
  )
}
