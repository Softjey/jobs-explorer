import { Link } from '@tanstack/react-router'
import type { ComponentProps } from 'react'
import { EmptyState } from '@/components/common/EmptyState'
import { JobGrid } from '@/components/jobs/JobGrid'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useFavouriteList } from '@/store/client/favourites/favourites.hooks'

type FavouritesPageProps = ComponentProps<'main'>

export function FavouritesPage({ className, ...props }: FavouritesPageProps) {
  const favourites = useFavouriteList()

  return (
    <main className={cn('mx-auto max-w-6xl px-6 pt-8 pb-16', className)} {...props}>
      <h1 className="mb-6 text-3xl font-bold tracking-tight">Favourites</h1>
      {favourites.length === 0 ? (
        <EmptyState
          title="No favourites yet"
          description="Tap the heart on a job to save it here."
          action={
            <Link to="/" className={buttonVariants()}>
              Browse jobs
            </Link>
          }
        />
      ) : (
        <JobGrid jobs={favourites} />
      )}
    </main>
  )
}
