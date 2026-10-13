import { Skeleton } from '@/components/ui/skeleton'

export function JobCardSkeleton() {
  return (
    <div
      data-testid="job-card-skeleton"
      aria-hidden
      className="flex flex-col gap-3.5 rounded-xl border border-slate-200 bg-white p-5"
    >
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="mt-3.5 h-6 w-1/3" />
    </div>
  )
}
