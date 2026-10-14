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

  const valid = Object.entries(parsed.data.items).flatMap(([key, value]) => {
    const id = jobIdSchema.safeParse(key)
    const favourite = favouriteJobSchema.safeParse(value)
    return id.success && favourite.success ? [[id.data, favourite.data] as const] : []
  })
  return Object.fromEntries(valid)
}
