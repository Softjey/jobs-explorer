import details from '@/test/fixtures/details.json'
import list from '@/test/fixtures/list.json'
import { jobDetailsSchema, jobPreviewSchema, jobSummarySchema } from './job.schema'

describe('job schemas', () => {
  it('parses every real list item', () => {
    for (const item of list.data.items) {
      expect(jobSummarySchema.safeParse(item).success).toBe(true)
    }
  })

  it('accepts a location without state and a skill without educationalLevelId', () => {
    const item = list.data.items[2]
    const parsed = jobSummarySchema.parse({
      ...item,
      jobLocation: { ...item?.jobLocation, state: undefined },
    })
    expect(parsed.jobSkill.educationalLevelId).toBeUndefined()
  })

  it('parses real job details', () => {
    const parsed = jobDetailsSchema.parse(details.data)
    expect(parsed.shiftsCount).toBe(14)
    expect(parsed.clothingRequirements).toBeUndefined()
  })

  it('rejects details without requirements', () => {
    const rest: Record<string, unknown> = { ...details.data }
    delete rest['requirements']
    expect(jobDetailsSchema.safeParse(rest).success).toBe(false)
  })

  it('strips a summary down to the preview fields', () => {
    const preview = jobPreviewSchema.parse(list.data.items[0])
    expect(Object.keys(preview).sort()).toEqual(
      [
        'datePublished',
        'hourlyWage',
        'jobLocation',
        'periodFrom',
        'workAssignmentId',
        'workAssignmentName',
      ].sort(),
    )
  })
})
