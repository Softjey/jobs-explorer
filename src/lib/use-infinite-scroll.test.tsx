import { render } from '@testing-library/react'
import { triggerIntersection } from '@/test/intersection'
import { useInfiniteScroll } from './use-infinite-scroll'

function Probe({ enabled, onLoadMore }: { enabled: boolean; onLoadMore: () => void }) {
  const ref = useInfiniteScroll({ enabled, onLoadMore })
  return <div ref={ref} data-testid="sentinel" />
}

describe('useInfiniteScroll', () => {
  it('calls onLoadMore when the sentinel becomes visible', () => {
    const onLoadMore = vi.fn()
    render(<Probe enabled onLoadMore={onLoadMore} />)
    triggerIntersection()
    expect(onLoadMore).toHaveBeenCalledTimes(1)
  })

  it('does not observe while disabled', () => {
    const onLoadMore = vi.fn()
    render(<Probe enabled={false} onLoadMore={onLoadMore} />)
    triggerIntersection()
    expect(onLoadMore).not.toHaveBeenCalled()
  })

  it('stops observing after unmount', () => {
    const onLoadMore = vi.fn()
    const { unmount } = render(<Probe enabled onLoadMore={onLoadMore} />)
    unmount()
    triggerIntersection()
    expect(onLoadMore).not.toHaveBeenCalled()
  })

  it('uses the latest onLoadMore without re-observing', () => {
    const first = vi.fn()
    const second = vi.fn()
    const { rerender } = render(<Probe enabled onLoadMore={first} />)
    rerender(<Probe enabled onLoadMore={second} />)
    triggerIntersection()
    expect(first).not.toHaveBeenCalled()
    expect(second).toHaveBeenCalledTimes(1)
  })
})
