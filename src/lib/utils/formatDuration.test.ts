import { describe, expect, it } from 'vitest'

import { formatDuration } from './formatDuration'

describe('formatDuration', () => {
  it('formats with default units (d, h, m)', () => {
    expect(formatDuration(190200)).toBe('2d 4h 50m')
    expect(formatDuration(3661)).toBe('1h 1m')
    expect(formatDuration(86400)).toBe('1d 0h 0m')
    expect(formatDuration(60)).toBe('1m')
  })

  it('formats with minutes and seconds', () => {
    expect(formatDuration(272, ['m', 's'])).toBe('4m 32s')
    expect(formatDuration(60, ['m', 's'])).toBe('1m 0s')
    expect(formatDuration(0, ['m', 's'])).toBe('0s')
  })

  it('skips leading zero-valued units', () => {
    expect(formatDuration(45, ['m', 's'])).toBe('45s')
    expect(formatDuration(30, ['d', 'h', 'm'])).toBe('0m')
    expect(formatDuration(3600)).toBe('1h 0m')
  })

  it('handles zero seconds', () => {
    expect(formatDuration(0)).toBe('0m')
  })

  it('clamps negative values to zero', () => {
    expect(formatDuration(-100)).toBe('0m')
    expect(formatDuration(-100, ['m', 's'])).toBe('0s')
  })

  it('formats with all four units', () => {
    expect(formatDuration(90061, ['d', 'h', 'm', 's'])).toBe('1d 1h 1m 1s')
  })
})
