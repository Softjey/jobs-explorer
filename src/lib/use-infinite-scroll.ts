import { useEffect, useEffectEvent, useRef } from 'react'

interface UseInfiniteScrollOptions {
  /** Observe the sentinel only while more can be loaded and nothing is loading. */
  enabled: boolean
  onLoadMore: () => void
}

/** Calls `onLoadMore` when the returned sentinel element scrolls into view. */
export function useInfiniteScroll({ enabled, onLoadMore }: UseInfiniteScrollOptions) {
  const sentinelRef = useRef<HTMLDivElement>(null)
  const loadMore = useEffectEvent(onLoadMore)

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!enabled || !sentinel) return

    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) loadMore()
    })
    observer.observe(sentinel)

    return () => {
      observer.disconnect()
    }
  }, [enabled])

  return sentinelRef
}
