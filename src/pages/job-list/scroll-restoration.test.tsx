import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderApp } from '@/test/render'

describe('job list scroll restoration', () => {
  const scrollTo = vi.fn()

  beforeEach(() => {
    scrollTo.mockClear()
    vi.stubGlobal('scrollTo', scrollTo)
    vi.stubGlobal('scrollX', 0)
    vi.stubGlobal('scrollY', 0)
  })

  async function openJobAfterScrollingTo(scrollY: number) {
    const app = await renderApp('/')
    const link = await screen.findByRole('link', { name: 'Stammdatenerfassung' })

    vi.stubGlobal('scrollY', scrollY)
    document.dispatchEvent(new Event('scroll'))

    await userEvent.click(link)
    await waitFor(() => {
      expect(app.router.state.location.pathname).toMatch(/^\/job\//)
    })
    return app
  }

  it('restores the scroll position after browser back', async () => {
    const { router } = await openJobAfterScrollingTo(500)

    router.history.back()
    await waitFor(() => {
      expect(router.state.location.pathname).toBe('/')
    })
    expect(scrollTo).toHaveBeenLastCalledWith(expect.objectContaining({ top: 500 }))
  })

  it('restores the scroll position after clicking "All jobs"', async () => {
    const { router } = await openJobAfterScrollingTo(700)

    await userEvent.click(screen.getByRole('link', { name: 'All jobs' }))
    await waitFor(() => {
      expect(router.state.location.pathname).toBe('/')
    })
    expect(scrollTo).toHaveBeenLastCalledWith(expect.objectContaining({ top: 700 }))
  })
})
