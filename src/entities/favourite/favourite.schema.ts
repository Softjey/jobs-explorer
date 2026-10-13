import { z } from 'zod'
import { jobPreviewSchema } from '../job/job.schema'

export const favouriteJobSchema = jobPreviewSchema.extend({
  addedAt: z.number(),
})
