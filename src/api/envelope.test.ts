import { z } from 'zod'
import { ApiError } from './api-error'
import { unwrapEnvelope } from './envelope'

const schema = z.object({ value: z.number() })

function failure(run: () => unknown): ApiError {
  try {
    run()
  } catch (e) {
    if (e instanceof ApiError) return e
    throw e
  }
  throw new Error('expected unwrapEnvelope to throw')
}

describe('unwrapEnvelope', () => {
  it('returns validated data', () => {
    const response = { ok: true, status: 200, body: { status: 200, data: { value: 3 } } }
    expect(unwrapEnvelope(response, schema)).toEqual({ value: 3 })
  })

  it('throws an http error with status, errorCode and errorId', () => {
    const body = { status: 404, error: true, errorCode: 'Object_not_found', errorId: 10004 }
    const error = failure(() => unwrapEnvelope({ ok: false, status: 404, body }, schema))
    expect(error).toMatchObject({
      kind: 'http',
      status: 404,
      errorCode: 'Object_not_found',
      errorId: 10004,
    })
  })

  it('throws an http error when the failed response has no JSON body', () => {
    const error = failure(() => unwrapEnvelope({ ok: false, status: 502, body: undefined }, schema))
    expect(error).toMatchObject({ kind: 'http', status: 502 })
    expect(error.errorCode).toBeUndefined()
  })

  it('treats error:true inside a 200 response as an http error', () => {
    const body = { status: 500, error: true, errorCode: 'Boom', errorId: 1 }
    const error = failure(() => unwrapEnvelope({ ok: true, status: 200, body }, schema))
    expect(error).toMatchObject({ kind: 'http', status: 500, errorCode: 'Boom' })
  })

  it('throws a schema error when data does not match', () => {
    const body = { status: 200, data: { value: 'x' } }
    const error = failure(() => unwrapEnvelope({ ok: true, status: 200, body }, schema))
    expect(error.kind).toBe('schema')
  })

  it('throws a schema error when a 200 response has no data', () => {
    const body = { status: 200, error: false }
    const error = failure(() => unwrapEnvelope({ ok: true, status: 200, body }, schema))
    expect(error.kind).toBe('schema')
  })

  it('throws a schema error when a 200 response is not JSON', () => {
    const error = failure(() => unwrapEnvelope({ ok: true, status: 200, body: undefined }, schema))
    expect(error.kind).toBe('schema')
  })
})
