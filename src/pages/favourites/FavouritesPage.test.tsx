import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderApp } from '@/test/render'
import list from '@/test/fixtures/list.json'
import { useFavouritesStore } from '@/store/client/favourites/favourites.store'

const job = list.data.items[0]
if (!job) throw new Error('fixture needs an item')

describe('FavouritesPage', () => {
  beforeEach(() => {
    useFavouritesStore.setState({ items: {} })
  })

  it('shows the empty state with a link to the list', async () => {
    await renderApp('/favourites')
    expect(await screen.findByText('No favourites yet')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Browse jobs' })).toHaveAttribute('href', '/')
  })

  it('renders saved jobs without requesting the API', async () => {
    useFavouritesStore.getState().toggle(job)
    await renderApp('/favourites')
    expect(await screen.findByRole('link', { name: job.workAssignmentName })).toHaveAttribute(
      'href',
      `/job/${job.workAssignmentId}`,
    )
  })

  it('removes a job from the page when un-marked', async () => {
    useFavouritesStore.getState().toggle(job)
    await renderApp('/favourites')
    await userEvent.click(await screen.findByRole('button', { name: 'Remove from favourites' }))
    expect(await screen.findByText('No favourites yet')).toBeInTheDocument()
  })

  it('shows the counter in the header', async () => {
    useFavouritesStore.getState().toggle(job)
    await renderApp('/favourites')
    expect(await screen.findByRole('link', { name: /Favourites/ })).toHaveTextContent('1')
  })

  it('shows the empty state when stored favourites are corrupted', async () => {
    localStorage.setItem('coople:favourites', '{broken')
    await useFavouritesStore.persist.rehydrate()
    await renderApp('/favourites')
    expect(await screen.findByText('No favourites yet')).toBeInTheDocument()
  })

  it('shows not-found for an unknown route', async () => {
    await renderApp('/nope')
    expect(await screen.findByText('Page not found')).toBeInTheDocument()
  })
})
