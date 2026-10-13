import { createFileRoute } from '@tanstack/react-router'
import { FavouritesPage } from '@/pages/favourites/FavouritesPage'

export const Route = createFileRoute('/favourites')({
  component: FavouritesPage,
})
