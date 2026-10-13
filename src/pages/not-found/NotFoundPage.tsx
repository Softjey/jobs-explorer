import { Link } from '@tanstack/react-router'
import type { ReactNode } from 'react'
import { EmptyState } from '@/components/common/EmptyState'
import { buttonVariants } from '@/components/ui/button'

interface NotFoundPageProps {
  title?: string
  description?: string
  children?: ReactNode
}

export function NotFoundPage({
  title = 'Page not found',
  description = 'The page does not exist or is no longer available.',
  children,
}: NotFoundPageProps) {
  return (
    <main className="mx-auto max-w-3xl px-6 pt-8 pb-16">
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
