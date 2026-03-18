import { describe, it, expect } from 'vitest'

import { historyFiltersToApiTypes } from './history-filter-mapping'

describe('historyFiltersToApiTypes', () => {
  it('returns empty array for undefined filters', () => {
    expect(historyFiltersToApiTypes(undefined)).toEqual([])
  })

  it('returns empty array for empty type and claimToken', () => {
    expect(historyFiltersToApiTypes({})).toEqual([])
    expect(historyFiltersToApiTypes({ type: [], claimToken: [] })).toEqual([])
  })

  it('maps type deposit to deposit_* API types', () => {
    const result = historyFiltersToApiTypes({ type: ['deposit'] })
    expect(result).toContain('deposit_request')
    expect(result).toContain('deposit_claimed')
    expect(result).toContain('deposit_cancelled')
    expect(result).toHaveLength(3)
  })

  it('maps type withdrawal to redeem_* API types', () => {
    const result = historyFiltersToApiTypes({ type: ['withdrawal'] })
    expect(result).toContain('redeem_request')
    expect(result).toContain('redeem_claimed')
    expect(result).toContain('redeem_cancelled')
    expect(result).toHaveLength(3)
  })

  it('maps claimToken rbtc to deposit_* API types', () => {
    const result = historyFiltersToApiTypes({ claimToken: ['rbtc'] })
    expect(result).toContain('deposit_request')
    expect(result).toContain('deposit_claimed')
    expect(result).toContain('deposit_cancelled')
    expect(result).toHaveLength(3)
  })

  it('maps claimToken shares to redeem_* API types', () => {
    const result = historyFiltersToApiTypes({ claimToken: ['shares'] })
    expect(result).toContain('redeem_request')
    expect(result).toContain('redeem_claimed')
    expect(result).toContain('redeem_cancelled')
    expect(result).toHaveLength(3)
  })

  it('combines type deposit and type withdrawal and dedupes', () => {
    const result = historyFiltersToApiTypes({ type: ['deposit', 'withdrawal'] })
    expect(result).toContain('deposit_request')
    expect(result).toContain('deposit_claimed')
    expect(result).toContain('deposit_cancelled')
    expect(result).toContain('redeem_request')
    expect(result).toContain('redeem_claimed')
    expect(result).toContain('redeem_cancelled')
    expect(result).toHaveLength(6)
  })

  it('combines type deposit and claimToken shares and dedupes', () => {
    const result = historyFiltersToApiTypes({ type: ['deposit'], claimToken: ['shares'] })
    expect(result).toContain('deposit_request')
    expect(result).toContain('deposit_claimed')
    expect(result).toContain('deposit_cancelled')
    expect(result).toContain('redeem_request')
    expect(result).toContain('redeem_claimed')
    expect(result).toContain('redeem_cancelled')
    expect(result).toHaveLength(6)
  })

  it('ignores status filter (status is applied client-side by hook)', () => {
    const result = historyFiltersToApiTypes({
      type: ['deposit'],
      status: ['pending', 'successful'],
    })
    expect(result).toHaveLength(3)
    expect(result).toEqual(['deposit_request', 'deposit_claimed', 'deposit_cancelled'])
  })

  it('combines claimToken rbtc and shares and dedupes', () => {
    const result = historyFiltersToApiTypes({ claimToken: ['rbtc', 'shares'] })
    expect(result).toHaveLength(6)
    expect(result).toContain('deposit_request')
    expect(result).toContain('redeem_request')
  })
})
