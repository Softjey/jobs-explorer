import type { ComponentProps } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

type JobDetailsSkeletonProps = ComponentProps<'div'>

export function JobDetailsSkeleton({ className, ...props }: JobDetailsSkeletonProps) {
  return (
    <div
      data-testid="job-details-skeleton"
      aria-hidden
      className={cn('flex flex-col gap-4', className)}
      {...props}
    >
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Skeleton className="h-16" />
        <Skeleton className="h-16" />
        <Skeleton className="h-16" />
        <Skeleton className="h-16" />
      </div>
      <Skeleton className="h-4 w-11/12" />
      <Skeleton className="h-4 w-4/5" />
      <Skeleton className="h-4 w-2/3" />
    </div>
  )
}
