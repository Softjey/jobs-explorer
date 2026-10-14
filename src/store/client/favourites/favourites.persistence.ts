import { z } from 'zod'
import { favouriteJobSchema } from '@/entities/favourite/favourite.schema'
import { jobIdSchema } from '@/entities/job/job.schema'
import { STORAGE_KEYS } from '../storage-keys'
import type { FavouriteItems } from './favourites.operations'

/** Bump when the shape of the stored data changes. Older data is dropped. */
export const FAVOURITES_STORAGE_VERSION = 1
export const FAVOURITES_STORAGE_NAME = STORAGE_KEYS.favourites

const storedFavouritesSchema = z.object({
  items: z.record(z.string(), z.unknown()),
})

/** One stored `[key, favourite]` pair. The key must be the favourite's own job id. */
const storedFavouriteEntrySchema = z
  .tuple([jobIdSchema, favouriteJobSchema])
  .refine(([id, favourite]) => id === favourite.workAssignmentId)

/** What to keep when the stored data is from an older version. */
export function migrateStoredFavourites(): { items: FavouriteItems } {
  return { items: {} }
}

/**
 * Takes the valid stored favourites one by one and drops the broken ones.
 * Keeps what the store already has if the stored data is not a favourites record at all.
 */
export function restoreFavourites(stored: unknown, current: FavouriteItems): FavouriteItems {
  const parsed = storedFavouritesSchema.safeParse(stored)
  if (!parsed.success) return current

  const valid = Object.entries(parsed.data.items).flatMap((entry) => {
    const result = storedFavouriteEntrySchema.safeParse(entry)
    return result.success ? [result.data] : []
  })
  return Object.fromEntries(valid)
}
