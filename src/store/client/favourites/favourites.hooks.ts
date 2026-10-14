import { useMemo } from 'react'
import type { FavouriteJob } from '@/entities/favourite'
import type { JobId } from '@/entities/job'
import { isInFavourites, newestFirst } from './favourites.operations'
import { useFavouritesStore } from './favourites.store'

export function useFavouriteList(): FavouriteJob[] {
  const items = useFavouritesStore((state) => state.items)
  return useMemo(() => newestFirst(items), [items])
}

/** Selects a number, so the caller re-renders only when the count changes. */
export function useFavouritesCount(): number {
  return useFavouritesStore((state) => Object.keys(state.items).length)
}

export function useIsFavourite(id: JobId): boolean {
  return useFavouritesStore((state) => isInFavourites(state.items, id))
}
