import type { ComponentProps } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

type JobCardSkeletonProps = ComponentProps<'div'>

export function JobCardSkeleton({ className, ...props }: JobCardSkeletonProps) {
  return (
    <div
      data-testid="job-card-skeleton"
      aria-hidden
      className={cn(
        'flex flex-col gap-3.5 rounded-xl border border-slate-200 bg-white p-5',
        className,
      )}
      {...props}
    >
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="mt-3.5 h-6 w-1/3" />
    </div>
  )
}
