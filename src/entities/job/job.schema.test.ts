import details from '@/test/fixtures/details.json'
import list from '@/test/fixtures/list.json'
import { jobDetailsSchema, jobIdSchema, jobPreviewSchema, jobSummarySchema } from './job.schema'

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

  it('rejects a list item with a non-UUID id', () => {
    const item = { ...list.data.items[0], workAssignmentId: 'not-a-uuid' }
    expect(jobSummarySchema.safeParse(item).success).toBe(false)
  })

  it('rejects wrong field types', () => {
    const item = list.data.items[0]
    expect(
      jobSummarySchema.safeParse({ ...item, hourlyWage: { amount: '27.5', currencyId: 1 } })
        .success,
    ).toBe(false)
    expect(jobSummarySchema.safeParse({ ...item, periodFrom: '2026-10-13' }).success).toBe(false)
    expect(jobSummarySchema.safeParse({ ...item, jobLocation: null }).success).toBe(false)
  })

  it('rejects a list item without a name', () => {
    const rest: Record<string, unknown> = { ...list.data.items[0] }
    delete rest['workAssignmentName']
    expect(jobSummarySchema.safeParse(rest).success).toBe(false)
  })

  it('rejects details without workDuration', () => {
    const rest: Record<string, unknown> = { ...details.data }
    delete rest['workDuration']
    expect(jobDetailsSchema.safeParse(rest).success).toBe(false)
  })

  it('rejects a preview without a location', () => {
    const rest: Record<string, unknown> = { ...list.data.items[0] }
    delete rest['jobLocation']
    expect(jobPreviewSchema.safeParse(rest).success).toBe(false)
  })

  it('validates job ids', () => {
    expect(jobIdSchema.safeParse('3b9d71a8-f900-496b-b0d0-433d587fbe04').success).toBe(true)
    expect(jobIdSchema.safeParse('').success).toBe(false)
    expect(jobIdSchema.safeParse(42).success).toBe(false)
  })
})
