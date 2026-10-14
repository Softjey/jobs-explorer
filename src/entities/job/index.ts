import type { z } from 'zod'
import type {
  jobDetailsSchema,
  jobLocationSchema,
  jobPreviewSchema,
  jobSummarySchema,
} from './job.schema'

export type JobLocation = z.infer<typeof jobLocationSchema>
export type JobSummary = z.infer<typeof jobSummarySchema>
export type JobDetails = z.infer<typeof jobDetailsSchema>
export type JobPreview = z.infer<typeof jobPreviewSchema>
export type JobId = JobSummary['workAssignmentId']
