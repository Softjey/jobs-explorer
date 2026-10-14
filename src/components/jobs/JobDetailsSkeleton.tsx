import type { ComponentProps } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

type JobDetailsSkeletonProps = ComponentProps<'div'>

const SECTION_LINES = ['w-full', 'w-11/12', 'w-4/5', 'w-2/3']

export function JobDetailsSkeleton({ className, ...props }: JobDetailsSkeletonProps) {
  return (
    <div
      data-testid="job-details-skeleton"
      aria-hidden
      className={cn('flex flex-col gap-7', className)}
      {...props}
    >
      <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-4">
        <Skeleton className="h-20" />
        <Skeleton className="h-20" />
        <Skeleton className="h-20" />
        <Skeleton className="h-20" />
      </div>
      <div className="flex flex-col gap-2.5">
        <Skeleton className="h-7 w-40" />
        {SECTION_LINES.map((width) => (
          <Skeleton key={width} className={cn('h-4', width)} />
        ))}
      </div>
      <div className="flex flex-col gap-2.5">
        <Skeleton className="h-7 w-28" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    </div>
  )
}
