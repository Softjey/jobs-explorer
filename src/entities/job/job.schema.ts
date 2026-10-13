import { z } from 'zod'
import { moneySchema } from '../money/money.schema'

export const jobLocationSchema = z.object({
  addressStreet: z.string(),
  extraAddress: z.string(),
  zip: z.string(),
  city: z.string(),
  countryId: z.number(),
  state: z.string().optional(),
})

export const jobSkillSchema = z.object({
  jobProfileId: z.number(),
  educationalLevelId: z.number().optional(),
})

export const jobSummarySchema = z.object({
  workAssignmentId: z.string(),
  waReadableId: z.string(),
  workAssignmentName: z.string(),
  branchLink: z.string(),
  hourlyWage: moneySchema,
  salary: moneySchema,
  jobSkill: jobSkillSchema,
  jobLocation: jobLocationSchema,
  periodFrom: z.number(),
  datePublished: z.number(),
})

export const jobDetailsSchema = jobSummarySchema.extend({
  requirements: z.string(),
  clothingRequirements: z.string().optional(),
  periodTo: z.number(),
  firstShiftTo: z.number(),
  shiftsCount: z.number(),
  workDuration: z.number(),
})

export const jobPreviewSchema = jobSummarySchema.pick({
  workAssignmentId: true,
  workAssignmentName: true,
  jobLocation: true,
  hourlyWage: true,
  periodFrom: true,
  datePublished: true,
})
