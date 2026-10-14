import { act, renderHook } from '@testing-library/react'
import list from '@/test/fixtures/list.json'
import { useFavouritesCount } from './favourites.hooks'
import { useFavouritesStore } from './favourites.store'

const [first, second] = list.data.items
if (!first || !second) throw new Error('fixture needs two items')

describe('useFavouritesCount', () => {
  beforeEach(() => {
    useFavouritesStore.setState({ items: {} })
  })

  it('is zero without favourites', () => {
    const { result } = renderHook(() => useFavouritesCount())
    expect(result.current).toBe(0)
  })

  it('follows adding and removing favourites', () => {
    const { result } = renderHook(() => useFavouritesCount())
    act(() => {
      useFavouritesStore.getState().toggle(first)
      useFavouritesStore.getState().toggle(second)
    })
    expect(result.current).toBe(2)
    act(() => {
      useFavouritesStore.getState().remove(first.workAssignmentId)
    })
    expect(result.current).toBe(1)
  })
})
