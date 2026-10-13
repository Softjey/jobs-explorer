import list from '@/test/fixtures/list.json'
import { favouriteJobSchema } from './favourite.schema'

describe('favouriteJobSchema', () => {
  it('requires addedAt on top of the preview', () => {
    const item = list.data.items[0]
    expect(favouriteJobSchema.safeParse({ ...item, addedAt: 1 }).success).toBe(true)
    expect(favouriteJobSchema.safeParse(item).success).toBe(false)
  })
})
