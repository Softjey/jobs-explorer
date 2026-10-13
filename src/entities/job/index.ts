import type { z } from 'zod'
import type {
  jobDetailsSchema,
  jobLocationSchema,
  jobPreviewSchema,
  jobSkillSchema,
  jobSummarySchema,
} from './job.schema'

export type JobLocation = z.infer<typeof jobLocationSchema>
export type JobSkill = z.infer<typeof jobSkillSchema>
export type JobSummary = z.infer<typeof jobSummarySchema>
export type JobDetails = z.infer<typeof jobDetailsSchema>
export type JobPreview = z.infer<typeof jobPreviewSchema>
