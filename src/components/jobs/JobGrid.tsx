import type { ComponentProps } from 'react'
import type { JobPreview } from '@/entities/job'
import { cn } from '@/lib/utils'
import { JobCard } from './JobCard'

interface JobGridProps extends ComponentProps<'div'> {
  jobs: JobPreview[]
}

/** Cards for `jobs`; extra `children` (e.g. skeletons) go after them. */
export function JobGrid({ jobs, children, className, ...props }: JobGridProps) {
  return (
    <div
      className={cn('grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4', className)}
      {...props}
    >
      {jobs.map((job) => (
        <JobCard key={job.workAssignmentId} job={job} />
      ))}
      {children}
    </div>
  )
}
