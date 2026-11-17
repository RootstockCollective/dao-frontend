import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { CycleBackingChart, filterCyclesToRange, getRangeShowing } from './CycleBackingChart'

const cycles = (...numbers: number[]) => numbers.map(cycleNumber => ({ cycleNumber }))
const numbersOf = (points: { cycleNumber: number }[]) => points.map(({ cycleNumber }) => cycleNumber)

describe('filterCyclesToRange', () => {
  const twoYears = cycles(...Array.from({ length: 52 }, (_, index) => index + 3))

  it('keeps the last 13 cycles for six months', () => {
    expect(numbersOf(filterCyclesToRange(twoYears, 'six-months'))).toEqual(
      Array.from({ length: 13 }, (_, index) => index + 42),
    )
  })

  it('keeps the last 26 cycles for one year', () => {
    const kept = filterCyclesToRange(twoYears, 'one-year')

    expect(kept).toHaveLength(26)
    expect(kept[0].cycleNumber).toBe(29)
  })

  it('keeps everything for all', () => {
    expect(filterCyclesToRange(twoYears, 'all')).toBe(twoYears)
  })

  it('counts by cycle number, so a hole in the series does not reach further back', () => {
    const withHoles = cycles(40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 52, 54)

    expect(numbersOf(filterCyclesToRange(withHoles, 'six-months'))).toEqual([
      42, 43, 44, 45, 46, 47, 48, 49, 50, 52, 54,
    ])
  })

  it('is empty for an empty series', () => {
    expect(filterCyclesToRange([], 'one-year')).toEqual([])
  })
})

describe('getRangeShowing', () => {
  it('keeps the range when the cycle is already in it', () => {
    expect(getRangeShowing('six-months', 54, 42)).toBe('six-months')
  })

  it('widens to the narrowest range holding the cycle', () => {
    expect(getRangeShowing('six-months', 54, 41)).toBe('one-year')
    expect(getRangeShowing('six-months', 54, 28)).toBe('all')
  })

  it('never narrows', () => {
    expect(getRangeShowing('all', 54, 54)).toBe('all')
  })
})

describe('CycleBackingChart', () => {
  it('opens on one year', () => {
    render(<CycleBackingChart cycles={[]} isLoading />)

    expect(screen.getByRole('radio', { name: '1 year' })).toHaveAttribute('aria-checked', 'true')
    expect(screen.getByRole('radio', { name: '6 months' })).toHaveAttribute('aria-checked', 'false')
    expect(screen.getByRole('radio', { name: 'All' })).toHaveAttribute('aria-checked', 'false')
  })
})
