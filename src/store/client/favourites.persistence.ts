import { z } from 'zod'
import { favouriteJobSchema } from '@/entities/favourite/favourite.schema'
import { jobIdSchema } from '@/entities/job/job.schema'
import { STORAGE_KEYS } from '@/lib/storage-keys'
import type { FavouriteItems } from './favourites.operations'

/** Bump when the shape of the stored data changes. Older data is dropped. */
export const FAVOURITES_STORAGE_VERSION = 1
export const FAVOURITES_STORAGE_NAME = STORAGE_KEYS.favourites

const storedFavouritesSchema = z.object({
  items: z.record(jobIdSchema, favouriteJobSchema),
})

/** What to keep when the stored data is from an older version. */
export function migrateStoredFavourites(): { items: FavouriteItems } {
  return { items: {} }
}

/** Takes stored favourites if they are valid, otherwise keeps what the store already has. */
export function restoreFavourites(stored: unknown, current: FavouriteItems): FavouriteItems {
  const parsed = storedFavouritesSchema.safeParse(stored)
  return parsed.success ? parsed.data.items : current
}
