import type { ParsedLocation } from '@tanstack/react-router'

const PATHNAME_KEYED_ROUTES = new Set(['/'])

/**
 * The job list keeps one scroll position per pathname, so "All jobs" (a new history entry)
 * lands where browser back would. Other routes keep the router's per-entry key.
 */
export function getScrollRestorationKey(location: ParsedLocation): string {
  if (PATHNAME_KEYED_ROUTES.has(location.pathname)) return location.pathname
  return location.state.__TSR_key ?? location.href
}
