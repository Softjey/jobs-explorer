import { Link } from '@tanstack/react-router'
import { EmptyState } from '@/components/common/EmptyState'
import { JobGrid } from '@/components/jobs/JobList'
import { buttonVariants } from '@/components/ui/button'
import { useFavouriteList } from '@/store/client/favourites.store'

export function FavouritesPage() {
  const favourites = useFavouriteList()

  return (
    <main className="mx-auto max-w-6xl px-6 pt-8 pb-16">
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
