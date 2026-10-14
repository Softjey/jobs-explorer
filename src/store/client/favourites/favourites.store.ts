import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import type { JobId, JobPreview } from '@/entities/job'
import {
  addToFavourites,
  isInFavourites,
  removeFromFavourites,
  type FavouriteItems,
} from './favourites.operations'
import {
  FAVOURITES_STORAGE_NAME,
  FAVOURITES_STORAGE_VERSION,
  migrateStoredFavourites,
  restoreFavourites,
} from './favourites.persistence'

interface FavouritesState {
  items: FavouriteItems
  /** Adds the job to favourites, or removes it if it is already there. */
  toggle: (job: JobPreview) => void
  remove: (id: JobId) => void
}

export const useFavouritesStore = create<FavouritesState>()(
  persist(
    (set, get) => ({
      items: {},

      toggle: (job) => {
        const { items } = get()
        const id = job.workAssignmentId
        set({
          items: isInFavourites(items, id)
            ? removeFromFavourites(items, id)
            : addToFavourites(items, job, Date.now()),
        })
      },

      remove: (id) => {
        set({ items: removeFromFavourites(get().items, id) })
      },
    }),
    {
      name: FAVOURITES_STORAGE_NAME,
      version: FAVOURITES_STORAGE_VERSION,
      storage: createJSONStorage(() => localStorage),
      partialize: ({ items }) => ({ items }),
      migrate: migrateStoredFavourites,
      merge: (stored, current) => ({
        ...current,
        items: restoreFavourites(stored, current.items),
      }),
    },
  ),
)
