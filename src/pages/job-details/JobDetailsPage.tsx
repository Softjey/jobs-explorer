import { Link } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import type { ComponentProps } from 'react'
import Markdown from 'react-markdown'
import { ErrorState } from '@/components/common/ErrorState'
import { FavouriteButton } from '@/components/jobs/FavouriteButton'
import { JobDetailsSkeleton } from '@/components/jobs/JobDetailsSkeleton'
import { Button } from '@/components/ui/button'
import type { JobId } from '@/entities/job'
import { formatDate, formatDuration, formatLocation, formatWage } from '@/lib/format'
import { cn } from '@/lib/utils'
import { useIsFavourite } from '@/store/client/favourites.hooks'
import { useFavouritesStore } from '@/store/client/favourites.store'
import { isNotFoundError } from '@/store/server/errors'
import { useJob, useJobPreview } from '@/store/server/jobs/jobs.hooks'
import { NotFoundPage } from '../not-found/NotFoundPage'

interface JobDetailsPageProps extends ComponentProps<'main'> {
  id: JobId
}

export function JobDetailsPage({ id, className, ...props }: JobDetailsPageProps) {
  const { data: job, error, isPending, refetch } = useJob(id)
  const preview = useJobPreview(id)
  const isFavourite = useIsFavourite(id)
  const removeFavourite = useFavouritesStore((state) => state.remove)

  if (isNotFoundError(error)) {
    return (
      <NotFoundPage
        title="Job not found"
        description="This job is no longer published or the link is wrong."
      >
        {isFavourite && (
          <Button
            variant="outline"
            onClick={() => {
              removeFavourite(id)
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
    <main className={cn('mx-auto max-w-3xl px-6 pt-6 pb-16', className)} {...props}>
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

interface FactProps extends ComponentProps<'div'> {
  label: string
  value: string
}

function Fact({ label, value, className, ...props }: FactProps) {
  return (
    <div className={cn('rounded-lg bg-slate-50 p-4', className)} {...props}>
      <dt className="mb-1 text-[13px] text-slate-600">{label}</dt>
      <dd className="font-semibold">{value}</dd>
    </div>
  )
}

interface SectionProps extends Omit<ComponentProps<'section'>, 'title'> {
  title: string
  text: string
}

function Section({ title, text, className, ...props }: SectionProps) {
  return (
    <section className={cn('flex flex-col gap-2.5', className)} {...props}>
      <h2 className="text-xl font-semibold">{title}</h2>
      <div className="leading-relaxed whitespace-pre-line">
        <Markdown>{text}</Markdown>
      </div>
    </section>
  )
}
