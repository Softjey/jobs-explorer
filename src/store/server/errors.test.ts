import { ApiError } from '@/api/api-error'
import { isNotFoundError } from './errors'

describe('isNotFoundError', () => {
  it('is true for an http 404', () => {
    expect(isNotFoundError(new ApiError('http', 'x', { status: 404 }))).toBe(true)
  })

  it('is false for other statuses, kinds and values', () => {
    expect(isNotFoundError(new ApiError('http', 'x', { status: 500 }))).toBe(false)
    expect(isNotFoundError(new ApiError('network', 'x'))).toBe(false)
    expect(isNotFoundError(null)).toBe(false)
  })
})
