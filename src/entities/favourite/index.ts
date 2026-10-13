import type { z } from 'zod'
import type { favouriteJobSchema } from './favourite.schema'

export type FavouriteJob = z.infer<typeof favouriteJobSchema>
