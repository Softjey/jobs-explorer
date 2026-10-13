import { Link } from '@tanstack/react-router'
import type { JobPreview } from '@/entities/job'
import { formatDate, formatLocation, formatWage } from '@/lib/format'
import { FavouriteButton } from './FavouriteButton'

interface JobCardProps {
  job: JobPreview
}

export function JobCard({ job }: JobCardProps) {
  return (
    <article className="flex flex-col gap-3.5 rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-lg leading-snug font-semibold">
          <Link to="/job/$id" params={{ id: job.workAssignmentId }} className="hover:underline">
            {job.workAssignmentName}
          </Link>
        </h2>
        <FavouriteButton job={job} />
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
