import { describe, expect, it } from 'vitest'

import { positiveNumberOr } from './env'

describe('positiveNumberOr', () => {
  it('reads a positive number', () => {
    expect(positiveNumberOr('100000', 1)).toBe(100_000)
    expect(positiveNumberOr('7.5', 1)).toBe(7.5)
    expect(positiveNumberOr('1e21', 1)).toBe(1e21)
  })

  it.each([undefined, '', '  ', 'abc', '0', '-5', 'Infinity', 'NaN'])('falls back on %p', value => {
    expect(positiveNumberOr(value, 42)).toBe(42)
  })
})
