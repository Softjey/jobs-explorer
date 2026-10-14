import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderApp } from '@/test/render'

const crash = vi.hoisted(() => ({ enabled: false }))

vi.mock('@/pages/favourites/FavouritesPage', () => ({
  FavouritesPage: () => {
    if (crash.enabled) throw new Error('render failed')
    return <p>Favourites rendered</p>
  },
}))

describe('root error boundary', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
    vi.spyOn(console, 'warn').mockImplementation(() => undefined)
  })

  it('renders the page again after Retry', async () => {
    crash.enabled = true
    await renderApp('/favourites')
    expect(await screen.findByText('Something went wrong')).toBeInTheDocument()

    crash.enabled = false
    await userEvent.click(screen.getByRole('button', { name: 'Retry' }))
    expect(await screen.findByText('Favourites rendered')).toBeInTheDocument()
  })
})
