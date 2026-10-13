import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { installIntersectionObserver } from './intersection'
import { server } from './server'

beforeAll(() => {
  server.listen({ onUnhandledFrame: 'error' })
})
beforeEach(() => {
  installIntersectionObserver()
})
afterEach(() => {
  cleanup()
  server.resetHandlers()
  localStorage.clear()
  vi.unstubAllGlobals()
})
afterAll(() => {
  server.close()
})
