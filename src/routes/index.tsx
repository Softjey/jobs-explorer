import { createFileRoute } from '@tanstack/react-router'
import { JobListPage } from '@/pages/job-list/JobListPage'
import { jobsInfiniteQueryOptions } from '@/store/server/jobs/jobs.queries'

export const Route = createFileRoute('/')({
  loader: ({ context }) => {
    void context.queryClient.infiniteQuery(jobsInfiniteQueryOptions()).catch(() => undefined)
  },
  component: JobListPage,
})
