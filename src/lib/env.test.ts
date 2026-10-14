import { z } from 'zod'

describe('env', () => {
  it('exposes the validated API base URL', async () => {
    const { env } = await import('./env')
    expect(env.VITE_API_BASE_URL).toBe('/api')
  })

  it('throws when the API base URL is missing', async () => {
    vi.resetModules()
    vi.stubEnv('VITE_API_BASE_URL', '')
    await expect(import('./env')).rejects.toBeInstanceOf(z.ZodError)
    vi.unstubAllEnvs()
  })
})
