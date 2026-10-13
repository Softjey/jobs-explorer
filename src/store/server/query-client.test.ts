import { ApiError } from '@/api/api-error'
import { shouldRetry } from './query-client'

describe('shouldRetry', () => {
  it('does not retry 4xx errors', () => {
    const error = new ApiError('http', 'not found', { status: 404 })
    expect(shouldRetry(0, error)).toBe(false)
  })

  it('retries 5xx errors twice', () => {
    const error = new ApiError('http', 'boom', { status: 500 })
    expect(shouldRetry(0, error)).toBe(true)
    expect(shouldRetry(1, error)).toBe(true)
    expect(shouldRetry(2, error)).toBe(false)
  })

  it('retries network errors', () => {
    expect(shouldRetry(0, new ApiError('network', 'offline'))).toBe(true)
  })

  it('retries unknown errors', () => {
    expect(shouldRetry(0, new Error('x'))).toBe(true)
  })
})
