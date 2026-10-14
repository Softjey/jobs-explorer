import type { ComponentProps, ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface EmptyStateProps extends Omit<ComponentProps<'div'>, 'title'> {
  title: string
  description?: string
  action?: ReactNode
}

export function EmptyState({ title, description, action, className, ...props }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center gap-3 rounded-xl border border-slate-200 bg-white px-6 py-10 text-center',
        className,
      )}
      {...props}
    >
      <h2 className="text-xl font-semibold">{title}</h2>
      {description && <p className="text-slate-600">{description}</p>}
      {action}
    </div>
  )
}
