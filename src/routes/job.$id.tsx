import { createFileRoute, notFound } from '@tanstack/react-router'
import { z } from 'zod'
import { JobDetailsPage } from '@/pages/job-details/JobDetailsPage'
import { NotFoundPage } from '@/pages/not-found/NotFoundPage'
import { jobQueryOptions } from '@/store/server/jobs/jobs.queries'

const idSchema = z.uuid()

export const Route = createFileRoute('/job/$id')({
  params: {
    parse: ({ id }) => {
      // eslint-disable-next-line @typescript-eslint/only-throw-error -- notFound() is the router's control-flow object
      if (!idSchema.safeParse(id).success) throw notFound()
      return { id }
    },
  },
  loader: ({ context, params }) => {
    void context.queryClient.query(jobQueryOptions(params.id)).catch(() => undefined)
  },
  component: JobDetailsRoute,
  notFoundComponent: () => (
    <NotFoundPage title="Job not found" description="The job link is not valid." />
  ),
})

function JobDetailsRoute() {
  const { id } = Route.useParams()
  return <JobDetailsPage id={id} />
}
