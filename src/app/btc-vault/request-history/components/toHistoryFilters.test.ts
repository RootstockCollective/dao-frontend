import { describe, it, expect } from 'vitest'

import type { ActiveFilter } from '@/components/FilterSideBar'

import { toHistoryFilters } from './BtcVaultHistoryTable'

function makeFilter(groupId: string, value: string): ActiveFilter {
  return { groupId, option: { label: value, value } }
}

describe('toHistoryFilters', () => {
  it('returns undefined for empty filters', () => {
    expect(toHistoryFilters([])).toBeUndefined()
  })

  it('extracts type filters', () => {
    const filters = [makeFilter('type', 'deposit')]
    expect(toHistoryFilters(filters)).toEqual({ type: ['deposit'] })
  })

  it('extracts claimToken filters', () => {
    const filters = [makeFilter('claimToken', 'rbtc')]
    expect(toHistoryFilters(filters)).toEqual({ claimToken: ['rbtc'] })
  })

  it('extracts status filters', () => {
    const filters = [makeFilter('status', 'pending'), makeFilter('status', 'cancelled')]
    expect(toHistoryFilters(filters)).toEqual({ status: ['pending', 'cancelled'] })
  })

  it('combines multiple filter groups', () => {
    const filters = [
      makeFilter('type', 'withdrawal'),
      makeFilter('claimToken', 'shares'),
      makeFilter('status', 'successful'),
    ]
    const result = toHistoryFilters(filters)
    expect(result).toEqual({
      type: ['withdrawal'],
      claimToken: ['shares'],
      status: ['successful'],
    })
  })

  it('rejects invalid type values via type guard', () => {
    const filters = [makeFilter('type', 'invalid_type')]
    expect(toHistoryFilters(filters)).toBeUndefined()
  })

  it('rejects invalid status values via type guard', () => {
    const filters = [makeFilter('status', 'nonexistent')]
    expect(toHistoryFilters(filters)).toBeUndefined()
  })

  it('keeps valid values and discards invalid ones', () => {
    const filters = [makeFilter('type', 'deposit'), makeFilter('type', 'bogus')]
    expect(toHistoryFilters(filters)).toEqual({ type: ['deposit'] })
  })

  it('returns undefined when all values are invalid', () => {
    const filters = [
      makeFilter('type', 'bad'),
      makeFilter('claimToken', 'nope'),
      makeFilter('status', 'wrong'),
    ]
    expect(toHistoryFilters(filters)).toBeUndefined()
  })
})
