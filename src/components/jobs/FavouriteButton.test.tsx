import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import list from '@/test/fixtures/list.json'
import { useFavouritesStore } from '@/store/client/favourites.store'
import { FavouriteButton } from './FavouriteButton'

const job = list.data.items[0]
if (!job) throw new Error('fixture needs an item')

describe('FavouriteButton', () => {
  beforeEach(() => {
    useFavouritesStore.setState({ items: {} })
  })

  it('toggles the favourite state and its label', async () => {
    render(<FavouriteButton job={job} />)
    await userEvent.click(screen.getByRole('button', { name: 'Add to favourites' }))
    expect(useFavouritesStore.getState().isFavourite(job.workAssignmentId)).toBe(true)

    await userEvent.click(screen.getByRole('button', { name: 'Remove from favourites' }))
    expect(useFavouritesStore.getState().isFavourite(job.workAssignmentId)).toBe(false)
  })

  it('shows a text label in the labelled variant', () => {
    render(<FavouriteButton job={job} variant="labelled" />)
    expect(screen.getByRole('button')).toHaveTextContent('Add to favourites')
  })
})
