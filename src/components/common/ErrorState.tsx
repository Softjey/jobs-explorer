import { CircleAlert } from 'lucide-react'
import type { ComponentProps } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ErrorStateProps extends Omit<ComponentProps<'div'>, 'title'> {
  title: string
  message?: string
  onRetry?: () => void
}

export function ErrorState({ title, message, onRetry, className, ...props }: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={cn(
        'flex flex-col items-center gap-3 rounded-xl border border-slate-200 bg-white px-6 py-10 text-center',
        className,
      )}
      {...props}
    >
      <CircleAlert aria-hidden className="size-8 text-red-700" />
      <h2 className="text-xl font-semibold">{title}</h2>
      {message && <p className="text-slate-600">{message}</p>}
      {onRetry && <Button onClick={onRetry}>Retry</Button>}
    </div>
  )
}
