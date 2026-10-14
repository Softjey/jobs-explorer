import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import list from '@/test/fixtures/list.json'
import { useFavouritesStore } from '@/store/client/favourites/favourites.store'
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
    expect(useFavouritesStore.getState().items).toHaveProperty([job.workAssignmentId])

    await userEvent.click(screen.getByRole('button', { name: 'Remove from favourites' }))
    expect(useFavouritesStore.getState().items).not.toHaveProperty([job.workAssignmentId])
  })

  it('shows a text label in the labelled variant', () => {
    render(<FavouriteButton job={job} variant="labelled" />)
    expect(screen.getByRole('button')).toHaveTextContent('Add to favourites')
  })

  it('calls a custom onClick and still toggles', async () => {
    const onClick = vi.fn()
    render(<FavouriteButton job={job} onClick={onClick} />)
    await userEvent.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledTimes(1)
    expect(useFavouritesStore.getState().items).toHaveProperty([job.workAssignmentId])
  })

  it('does not mark other jobs as favourite', async () => {
    render(<FavouriteButton job={job} />)
    await userEvent.click(screen.getByRole('button'))
    expect(Object.keys(useFavouritesStore.getState().items)).toEqual([job.workAssignmentId])
  })
})
