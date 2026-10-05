import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { usePrefersReducedMotion } from './usePrefersReducedMotion'

/** A media query whose answer the test can change, telling its listeners as a browser would. */
const mockReducedMotion = (matches: boolean) => {
  const listeners = new Set<() => void>()
  const query = {
    matches,
    addEventListener: (_: string, listener: () => void) => listeners.add(listener),
    removeEventListener: (_: string, listener: () => void) => listeners.delete(listener),
  }
  vi.spyOn(window, 'matchMedia').mockReturnValue(query as unknown as MediaQueryList)

  return {
    listeners,
    change: (next: boolean) => {
      query.matches = next
      listeners.forEach(listener => listener())
    },
  }
}

describe('usePrefersReducedMotion', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('reads the preference on mount', () => {
    mockReducedMotion(true)

    const { result } = renderHook(() => usePrefersReducedMotion())

    expect(result.current).toBe(true)
  })

  it('follows the viewer changing it', () => {
    const preference = mockReducedMotion(false)
    const { result } = renderHook(() => usePrefersReducedMotion())

    act(() => preference.change(true))

    expect(result.current).toBe(true)
  })

  it('stops listening on unmount', () => {
    const preference = mockReducedMotion(false)
    const { unmount } = renderHook(() => usePrefersReducedMotion())

    unmount()

    expect(preference.listeners.size).toBe(0)
  })
})
