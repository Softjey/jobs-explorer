import { z } from 'zod'
import { paginatedSchema } from './pagination.schema'

describe('paginatedSchema', () => {
  const schema = paginatedSchema(z.object({ id: z.number() }))

  it('parses items and total', () => {
    expect(schema.parse({ items: [{ id: 1 }], total: 5 })).toEqual({ items: [{ id: 1 }], total: 5 })
  })

  it('rejects a missing total', () => {
    expect(schema.safeParse({ items: [] }).success).toBe(false)
  })
})
