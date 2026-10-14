import { Link } from '@tanstack/react-router'
import type { ComponentProps } from 'react'
import { EmptyState } from '@/components/common/EmptyState'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface NotFoundPageProps extends Omit<ComponentProps<'main'>, 'title'> {
  title?: string
  description?: string
}

export function NotFoundPage({
  title = 'Page not found',
  description = 'The page does not exist or is no longer available.',
  children,
  className,
  ...props
}: NotFoundPageProps) {
  return (
    <main className={cn('mx-auto max-w-3xl px-6 pt-8 pb-16', className)} {...props}>
      <EmptyState
        title={title}
        description={description}
        action={
          <div className="flex flex-wrap justify-center gap-3">
            <Link to="/" className={buttonVariants()}>
              Back to jobs
            </Link>
            {children}
          </div>
        }
      />
    </main>
  )
}
