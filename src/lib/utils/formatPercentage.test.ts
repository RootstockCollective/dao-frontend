import { formatPercentage } from '@/lib/utils'
import { describe, expect, it } from 'vitest'

describe('formatPercentage', () => {
  it('pads to 2 decimal places with % suffix', () => {
    expect(formatPercentage(10.2)).toBe('10.20%')
    expect(formatPercentage(10)).toBe('10.00%')
    expect(formatPercentage(0)).toBe('0.00%')
  })

  it('rounds to 2 decimal places', () => {
    expect(formatPercentage(10.123)).toBe('10.12%')
    expect(formatPercentage(10.126)).toBe('10.13%')
    expect(formatPercentage(33.335)).toBe('33.34%')
  })

  it('handles values above 100', () => {
    expect(formatPercentage(150)).toBe('150.00%')
    expect(formatPercentage(100.5)).toBe('100.50%')
  })

  it('handles negative values', () => {
    expect(formatPercentage(-5.3)).toBe('-5.30%')
  })
})
