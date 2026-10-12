import { describe, expect, it } from 'vitest'

import Big from '@/lib/big'

import { CycleHistoryEntry } from '../types'
import { getDefaultCycle } from './CycleDashboardContext'

const entry = (cycleNumber: number, overrides: Partial<CycleHistoryEntry> = {}): CycleHistoryEntry => ({
  cycleNumber,
  start: new Date(0),
  end: new Date(0),
  backing: 0n,
  rewards: [],
  rewardsFiat: Big(0),
  backersShare: 0.5,
  backersCount: null,
  status: 'settled',
  ...overrides,
})

describe('getDefaultCycle', () => {
  it('opens on the running cycle even before its split lands', () => {
    const running = entry(46, { status: 'running', backersShare: null })

    expect(getDefaultCycle([running, entry(45)])).toBe(running)
  })

  it('skips a settled cycle whose split never landed', () => {
    const complete = entry(43)

    expect(getDefaultCycle([entry(44, { backersShare: null }), complete])).toBe(complete)
  })

  it('falls back to the newest cycle when none has a split', () => {
    const newest = entry(44, { backersShare: null })

    expect(getDefaultCycle([newest, entry(43, { backersShare: null })])).toBe(newest)
  })

  it('is undefined without cycles', () => {
    expect(getDefaultCycle([])).toBeUndefined()
  })
})
