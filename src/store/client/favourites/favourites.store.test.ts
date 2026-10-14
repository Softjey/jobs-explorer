import list from '@/test/fixtures/list.json'
import { STORAGE_KEYS } from '../storage-keys'
import { isInFavourites, newestFirst } from './favourites.operations'
import { useFavouritesStore } from './favourites.store'

const [first, second] = list.data.items
if (!first || !second) throw new Error('fixture needs two items')

function isFavourite(id: string): boolean {
  return isInFavourites(useFavouritesStore.getState().items, id)
}

function reset() {
  useFavouritesStore.setState({ items: {} })
}

describe('favourites store', () => {
  beforeEach(reset)

  it('toggle adds a job and a second toggle removes it', () => {
    const { toggle } = useFavouritesStore.getState()
    toggle(first)
    expect(isFavourite(first.workAssignmentId)).toBe(true)
    toggle(first)
    expect(isFavourite(first.workAssignmentId)).toBe(false)
  })

  it('stores only the preview fields and addedAt', () => {
    useFavouritesStore.getState().toggle(first)
    const stored = useFavouritesStore.getState().items[first.workAssignmentId]
    expect(stored).toBeDefined()
    expect(stored).not.toHaveProperty('branchLink')
    expect(typeof stored?.addedAt).toBe('number')
  })

  it('remove deletes a job', () => {
    useFavouritesStore.getState().toggle(first)
    useFavouritesStore.getState().remove(first.workAssignmentId)
    expect(useFavouritesStore.getState().items).toEqual({})
  })

  it('lists the newest favourite first', () => {
    vi.spyOn(Date, 'now').mockReturnValueOnce(1000).mockReturnValueOnce(2000)
    const { toggle } = useFavouritesStore.getState()
    toggle(first)
    toggle(second)
    const ids = newestFirst(useFavouritesStore.getState().items).map((j) => j.workAssignmentId)
    expect(ids).toEqual([second.workAssignmentId, first.workAssignmentId])
  })

  it('persists to localStorage', () => {
    useFavouritesStore.getState().toggle(first)
    const raw = localStorage.getItem(STORAGE_KEYS.favourites)
    expect(raw).toContain(first.workAssignmentId)
  })

  it('rehydrates valid persisted data', async () => {
    const item = { ...first, addedAt: 5 }
    localStorage.setItem(
      STORAGE_KEYS.favourites,
      JSON.stringify({ state: { items: { [first.workAssignmentId]: item } }, version: 1 }),
    )
    await useFavouritesStore.persist.rehydrate()
    expect(isFavourite(first.workAssignmentId)).toBe(true)
  })

  it('resets to empty when persisted data is invalid', async () => {
    localStorage.setItem(
      STORAGE_KEYS.favourites,
      JSON.stringify({ state: { items: { x: { nope: true } } }, version: 1 }),
    )
    await useFavouritesStore.persist.rehydrate()
    expect(useFavouritesStore.getState().items).toEqual({})
  })

  it('keeps the valid favourites when one stored entry is invalid', async () => {
    const items = {
      [first.workAssignmentId]: { ...first, addedAt: 5 },
      [second.workAssignmentId]: { nope: true },
      'not-an-id': { ...second, addedAt: 6 },
    }
    localStorage.setItem(STORAGE_KEYS.favourites, JSON.stringify({ state: { items }, version: 1 }))
    await useFavouritesStore.persist.rehydrate()
    expect(Object.keys(useFavouritesStore.getState().items)).toEqual([first.workAssignmentId])
  })

  it('drops a stored favourite whose key is not its own job id', async () => {
    const items = {
      [first.workAssignmentId]: { ...first, addedAt: 5 },
      [second.workAssignmentId]: { ...first, addedAt: 6 },
    }
    localStorage.setItem(STORAGE_KEYS.favourites, JSON.stringify({ state: { items }, version: 1 }))
    await useFavouritesStore.persist.rehydrate()
    expect(Object.keys(useFavouritesStore.getState().items)).toEqual([first.workAssignmentId])
  })

  it('resets to empty when persisted data is not JSON', async () => {
    localStorage.setItem(STORAGE_KEYS.favourites, '{broken')
    await useFavouritesStore.persist.rehydrate()
    expect(useFavouritesStore.getState().items).toEqual({})
  })

  it('resets to empty when the persisted version is unknown', async () => {
    const item = { ...first, addedAt: 5 }
    localStorage.setItem(
      STORAGE_KEYS.favourites,
      JSON.stringify({ state: { items: { [first.workAssignmentId]: item } }, version: 99 }),
    )
    await useFavouritesStore.persist.rehydrate()
    expect(useFavouritesStore.getState().items).toEqual({})
  })

  it('ignores remove for an id that is not a favourite', () => {
    useFavouritesStore.getState().toggle(first)
    useFavouritesStore.getState().remove('00000000-0000-4000-8000-000000000000')
    expect(Object.keys(useFavouritesStore.getState().items)).toEqual([first.workAssignmentId])
  })

  it('reports an unknown id as not a favourite', () => {
    expect(isFavourite('00000000-0000-4000-8000-000000000000')).toBe(false)
  })

  it('throws and stores nothing when toggling an invalid job', () => {
    const broken = { ...first, hourlyWage: null } as unknown as Parameters<
      ReturnType<typeof useFavouritesStore.getState>['toggle']
    >[0]
    expect(() => {
      useFavouritesStore.getState().toggle(broken)
    }).toThrow()
    expect(useFavouritesStore.getState().items).toEqual({})
  })

  it('resets to empty when a stored key is not a job id', async () => {
    const item = { ...first, addedAt: 5 }
    localStorage.setItem(
      STORAGE_KEYS.favourites,
      JSON.stringify({ state: { items: { 'not-an-id': item } }, version: 1 }),
    )
    await useFavouritesStore.persist.rehydrate()
    expect(useFavouritesStore.getState().items).toEqual({})
  })

  it('resets to empty when the stored state is not an object', async () => {
    localStorage.setItem(STORAGE_KEYS.favourites, JSON.stringify({ state: 'oops', version: 1 }))
    await useFavouritesStore.persist.rehydrate()
    expect(useFavouritesStore.getState().items).toEqual({})
  })
})
