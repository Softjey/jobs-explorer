type Callback = (entries: Partial<IntersectionObserverEntry>[]) => void

const observers = new Set<{ callback: Callback; elements: Set<Element> }>()

class MockIntersectionObserver {
  private readonly entry: { callback: Callback; elements: Set<Element> }

  constructor(callback: Callback) {
    this.entry = { callback, elements: new Set() }
    observers.add(this.entry)
  }

  observe(element: Element) {
    this.entry.elements.add(element)
  }

  unobserve(element: Element) {
    this.entry.elements.delete(element)
  }

  disconnect() {
    observers.delete(this.entry)
  }

  takeRecords() {
    return []
  }
}

export function installIntersectionObserver() {
  vi.stubGlobal('IntersectionObserver', MockIntersectionObserver)
}

/** Reports every observed element as visible. */
export function triggerIntersection() {
  for (const { callback, elements } of observers) {
    if (elements.size > 0) {
      callback([...elements].map((target) => ({ isIntersecting: true, target })))
    }
  }
}
