import { Link } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import Markdown from 'react-markdown'
import { ErrorState } from '@/components/common/ErrorState'
import { JobDetailsSkeleton } from '@/components/jobs/JobDetailsSkeleton'
import { FavouriteButton } from '@/components/jobs/FavouriteButton'
import { Button } from '@/components/ui/button'
import { ApiError } from '@/api/api-error'
import { formatDate, formatDuration, formatLocation, formatWage } from '@/lib/format'
import { useFavouritesStore, useIsFavourite } from '@/store/client/favourites.store'
import { useJob, useJobPreview } from '@/store/server/jobs/jobs.hooks'
import { NotFoundPage } from '../not-found/NotFoundPage'

interface JobDetailsPageProps {
  id: string
}

export function JobDetailsPage({ id }: JobDetailsPageProps) {
  const { data: job, error, isPending, refetch } = useJob(id)
  const preview = useJobPreview(id)
  const isFavourite = useIsFavourite(id)
  const remove = useFavouritesStore((state) => state.remove)

  if (error instanceof ApiError && error.kind === 'http' && error.status === 404) {
    return (
      <NotFoundPage
        title="Job not found"
        description="This job is no longer published or the link is wrong."
      >
        {isFavourite && (
          <Button
            variant="outline"
            onClick={() => {
              remove(id)
            }}
          >
            Remove from favourites
          </Button>
        )}
      </NotFoundPage>
    )
  }

  const header = job ?? preview

  return (
    <main className="mx-auto max-w-3xl px-6 pt-6 pb-16">
      <Link
        to="/"
        className="inline-flex min-h-11 items-center gap-2 font-semibold text-blue-800 hover:underline"
      >
        <ArrowLeft aria-hidden className="size-5" />
        All jobs
      </Link>

      <article className="mt-2 flex flex-col gap-7 rounded-xl border border-slate-200 bg-white p-8">
        {error && !job ? (
          <ErrorState
            title="Could not load the job"
            message="Check your connection and try again."
            onRetry={() => void refetch()}
          />
        ) : (
          <>
            {header && (
              <header className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex min-w-0 flex-1 basis-80 flex-col gap-2">
                  <h1 className="text-3xl leading-tight font-bold tracking-tight">
                    {header.workAssignmentName}
                  </h1>
                  <span className="text-slate-600">
                    {formatLocation(header.jobLocation)} · Published{' '}
                    {formatDate(header.datePublished)}
                  </span>
                </div>
                <FavouriteButton job={header} variant="labelled" />
              </header>
            )}
            {isPending && <JobDetailsSkeleton />}
            {job && (
              <>
                <dl className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-4">
                  <Fact label="Hourly wage" value={formatWage(job.hourlyWage)} />
                  <Fact
                    label="Period"
                    value={`${formatDate(job.periodFrom)} – ${formatDate(job.periodTo)}`}
                  />
                  <Fact
                    label="Shifts"
                    value={`${job.shiftsCount} shifts · ${formatDuration(job.workDuration)}`}
                  />
                  <Fact label="Job ID" value={job.waReadableId} />
                </dl>
                <Section title="Requirements" text={job.requirements} />
                {job.clothingRequirements && (
                  <Section title="Clothing" text={job.clothingRequirements} />
                )}
              </>
            )}
          </>
        )}
      </article>
    </main>
  )
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-50 p-4">
      <dt className="mb-1 text-[13px] text-slate-600">{label}</dt>
      <dd className="font-semibold">{value}</dd>
    </div>
  )
}

function Section({ title, text }: { title: string; text: string }) {
  return (
    <section className="flex flex-col gap-2.5">
      <h2 className="text-xl font-semibold">{title}</h2>
      <div className="leading-relaxed whitespace-pre-line">
        <Markdown>{text}</Markdown>
      </div>
    </section>
  )
}
