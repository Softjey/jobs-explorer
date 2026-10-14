import type { ComponentProps } from 'react'
import { EmptyState } from '@/components/common/EmptyState'
import { ErrorState } from '@/components/common/ErrorState'
import { JobCardSkeleton } from '@/components/jobs/JobCardSkeleton'
import { JobGrid } from '@/components/jobs/JobGrid'
import { Button } from '@/components/ui/button'
import { useInfiniteScroll } from '@/lib/use-infinite-scroll'
import { cn } from '@/lib/utils'
import { useJobs } from '@/store/server/jobs/jobs.hooks'

type JobListPageProps = ComponentProps<'main'>

const FIRST_LOAD_SKELETONS = 6
const NEXT_PAGE_SKELETONS = 3

function Skeletons({ count }: { count: number }) {
  return Array.from({ length: count }, (_, index) => <JobCardSkeleton key={index} />)
}

export function JobListPage(props: JobListPageProps) {
  const jobs = useJobs()

  const canLoadMore = jobs.hasNextPage && !jobs.isFetchingNextPage && !jobs.isFetchNextPageError
  const sentinelRef = useInfiniteScroll({
    enabled: canLoadMore,
    onLoadMore: () => void jobs.fetchNextPage(),
  })

  if (jobs.isPending) {
    return (
      <Page {...props}>
        <JobGrid jobs={[]}>
          <Skeletons count={FIRST_LOAD_SKELETONS} />
        </JobGrid>
      </Page>
    )
  }

  if (jobs.isError && jobs.jobs.length === 0) {
    return (
      <Page {...props}>
        <ErrorState
          title="Could not load jobs"
          message="Check your connection and try again."
          onRetry={() => void jobs.refetch()}
        />
      </Page>
    )
  }

  if (jobs.jobs.length === 0) {
    return (
      <Page {...props}>
        <EmptyState title="No jobs" />
      </Page>
    )
  }

  return (
    <Page count={`Showing ${jobs.jobs.length} of ${jobs.total}`} {...props}>
      <JobGrid jobs={jobs.jobs}>
        {jobs.isFetchingNextPage && <Skeletons count={NEXT_PAGE_SKELETONS} />}
      </JobGrid>

      {jobs.isFetchNextPageError && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-5 py-4">
          <span className="font-medium text-red-700">Could not load more jobs</span>
          <Button variant="outline" onClick={() => void jobs.fetchNextPage()}>
            Retry
          </Button>
        </div>
      )}

      {jobs.hasNextPage ? (
        <div ref={sentinelRef} aria-hidden className="h-1" />
      ) : (
        <p className="mt-8 text-center text-sm text-slate-600">End of list</p>
      )}
    </Page>
  )
}

interface PageProps extends ComponentProps<'main'> {
  count?: string
}

function Page({ count, children, className, ...props }: PageProps) {
  return (
    <main className={cn('mx-auto max-w-6xl px-6 pt-8 pb-16', className)} {...props}>
      <div className="mb-6 flex flex-wrap items-baseline justify-between gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Open jobs</h1>
        {count && <span className="text-[15px] text-slate-600">{count}</span>}
      </div>
      {children}
    </main>
  )
}
