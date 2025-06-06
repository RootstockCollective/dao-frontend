import { formatPercentage } from '@/lib/utils'
import { describe, expect, it } from 'vitest'

describe('formatPercentage', () => {
  it('should format decimal numbers correctly', () => {
    expect(formatPercentage(10.123)).toBe('10.12')
    expect(formatPercentage(10.126)).toBe('10.13')
    expect(formatPercentage(10.1)).toBe('10.1')
    expect(formatPercentage(10)).toBe('10')
  })

  it('should handle edge cases', () => {
    expect(formatPercentage(0)).toBe('0')
    expect(formatPercentage(99.999)).toBe('100')
  })

  it('should handle very small numbers', () => {
    expect(formatPercentage(0.001)).toBe('0')
    expect(formatPercentage(0.009)).toBe('0.01')
    expect(formatPercentage(0.123)).toBe('0.12')
  })

  it('should handle numbers with trailing zeros', () => {
    expect(formatPercentage(10.0)).toBe('10')
    expect(formatPercentage(10.1)).toBe('10.1')
    expect(formatPercentage(10.2)).toBe('10.2')
  })

  it('should reject values outside of 0-100 range', () => {
    expect(() => formatPercentage(-1)).toThrow('Percentage value must be between 0 and 100')
    expect(() => formatPercentage(-0.1)).toThrow('Percentage value must be between 0 and 100')
    expect(() => formatPercentage(-999999.999)).toThrow('Percentage value must be between 0 and 100')
    expect(() => formatPercentage(101)).toThrow('Percentage value must be between 0 and 100')
    expect(() => formatPercentage(100.1)).toThrow('Percentage value must be between 0 and 100')
  })
})
