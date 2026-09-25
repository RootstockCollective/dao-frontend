import { describe, expect, it } from 'vitest'

import { getNextDocked, getScrollProgress } from './useScrollDock'

describe('getScrollProgress', () => {
  const TOP_BAR_BOTTOM = 64

  it('is 0 while the banner sits below the top bar', () => {
    expect(getScrollProgress(136, 300, TOP_BAR_BOTTOM)).toBe(0)
  })

  it('grows as the banner slides under the top bar', () => {
    // 64 + 16 - (-70) = 150, half of the banner
    expect(getScrollProgress(-70, 300, TOP_BAR_BOTTOM)).toBe(0.5)
  })

  it('stops at 1 once the banner is gone', () => {
    expect(getScrollProgress(-2000, 300, TOP_BAR_BOTTOM)).toBe(1)
  })
})

describe('getNextDocked', () => {
  it('docks only past 75%', () => {
    expect(getNextDocked(false, 0.75)).toBe(false)
    expect(getNextDocked(false, 0.76)).toBe(true)
  })

  it('stays docked down to 60%, so stopping near the edge does not flicker', () => {
    expect(getNextDocked(true, 0.7)).toBe(true)
    expect(getNextDocked(true, 0.61)).toBe(true)
    expect(getNextDocked(true, 0.6)).toBe(false)
  })
})
