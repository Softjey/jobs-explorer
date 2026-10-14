import { Link } from '@tanstack/react-router'
import type { ComponentProps } from 'react'
import type { JobPreview } from '@/entities/job'
import { formatDate, formatLocation, formatWage } from '@/lib/format'
import { cn } from '@/lib/utils'
import { FavouriteButton } from './FavouriteButton'

interface JobCardProps extends ComponentProps<'article'> {
  job: JobPreview
}

export function JobCard({ job, className, ...props }: JobCardProps) {
  return (
    <article
      className={cn(
        'relative flex flex-col gap-3.5 rounded-xl border border-slate-200 bg-white p-5 hover:border-slate-300 hover:shadow-sm',
        className,
      )}
      {...props}
    >
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-lg leading-snug font-semibold">
          <Link
            to="/job/$id"
            params={{ id: job.workAssignmentId }}
            className="after:absolute after:inset-0 after:content-[''] hover:underline"
          >
            {job.workAssignmentName}
          </Link>
        </h2>
        <FavouriteButton job={job} className="relative z-10" />
      </div>
      <div className="flex flex-col gap-1.5 text-[15px] text-slate-600">
        <span>{formatLocation(job.jobLocation)}</span>
        <span>
          Starts {formatDate(job.periodFrom)} · Published {formatDate(job.datePublished)}
        </span>
      </div>
      <div className="mt-auto flex items-baseline justify-between border-t border-slate-200 pt-3.5">
        <span className="text-xl font-bold">{formatWage(job.hourlyWage)}</span>
        <span className="text-sm text-slate-600">per hour</span>
      </div>
    </article>
  )
}
