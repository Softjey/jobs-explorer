import type { FavouriteJob } from '@/entities/favourite'
import { jobPreviewSchema } from '@/entities/job/job.schema'
import type { JobId, JobPreview } from '@/entities/job'

export type FavouriteItems = Record<JobId, FavouriteJob>

export function isInFavourites(items: FavouriteItems, id: JobId): boolean {
  return id in items
}

/** Keeps only the fields the card shows, and remembers when the job was added. */
export function addToFavourites(
  items: FavouriteItems,
  job: JobPreview,
  addedAt: FavouriteJob['addedAt'],
): FavouriteItems {
  const preview = jobPreviewSchema.parse(job)
  return { ...items, [preview.workAssignmentId]: { ...preview, addedAt } }
}

export function removeFromFavourites(items: FavouriteItems, id: JobId): FavouriteItems {
  const kept = Object.entries(items).filter(([itemId]) => itemId !== id)
  return Object.fromEntries(kept)
}

export function newestFirst(items: FavouriteItems): FavouriteJob[] {
  return Object.values(items).sort((a, b) => b.addedAt - a.addedAt)
}
