import type { JobPreview } from '@/entities/job'
import { JobCard } from './JobCard'

interface JobListProps {
  jobs: JobPreview[]
  children?: React.ReactNode
}

export function JobGrid({ jobs, children }: JobListProps) {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4">
      {jobs.map((job) => (
        <JobCard key={job.workAssignmentId} job={job} />
      ))}
      {children}
    </div>
  )
}
