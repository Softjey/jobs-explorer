import { useMemo } from 'react'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { z } from 'zod'
import type { FavouriteJob } from '@/entities/favourite'
import { favouriteJobSchema } from '@/entities/favourite/favourite.schema'
import type { JobPreview } from '@/entities/job'
import { jobPreviewSchema } from '@/entities/job/job.schema'

export const FAVOURITES_STORAGE_KEY = 'coople:favourites'
const STORAGE_VERSION = 1

const persistedSchema = z.object({ items: z.record(z.string(), favouriteJobSchema) })

interface FavouritesState {
  items: Record<string, FavouriteJob>
  toggle: (job: JobPreview) => void
  remove: (id: string) => void
  isFavourite: (id: string) => boolean
}

export const useFavouritesStore = create<FavouritesState>()(
  persist(
    (set, get) => ({
      items: {},
      toggle: (job) => {
        const preview = jobPreviewSchema.parse(job)
        const { [preview.workAssignmentId]: existing, ...rest } = get().items
        set({
          items: existing
            ? rest
            : { ...rest, [preview.workAssignmentId]: { ...preview, addedAt: Date.now() } },
        })
      },
      remove: (id) => {
        const items = Object.entries(get().items).filter(([key]) => key !== id)
        set({ items: Object.fromEntries(items) })
      },
      isFavourite: (id) => id in get().items,
    }),
    {
      name: FAVOURITES_STORAGE_KEY,
      version: STORAGE_VERSION,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }),
      migrate: () => ({ items: {} }),
      merge: (persisted, current) => {
        const parsed = persistedSchema.safeParse(persisted)
        return parsed.success ? { ...current, items: parsed.data.items } : current
      },
    },
  ),
)

export function selectFavouriteList(state: Pick<FavouritesState, 'items'>): FavouriteJob[] {
  return Object.values(state.items).sort((a, b) => b.addedAt - a.addedAt)
}

export function useFavouriteList(): FavouriteJob[] {
  const items = useFavouritesStore((state) => state.items)
  return useMemo(() => selectFavouriteList({ items }), [items])
}

export function useIsFavourite(id: string): boolean {
  return useFavouritesStore((state) => id in state.items)
}
