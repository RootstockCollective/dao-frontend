import { describe, it, expect } from 'vitest'

import type { VaultRequest } from '../../services/types'
import { applyFilters, paginate } from './useRequestHistory'

const ONE_BTC = 10n ** 18n

function makeRequest(overrides: Partial<VaultRequest> & Pick<VaultRequest, 'id' | 'type' | 'status'>): VaultRequest {
  return {
    amount: ONE_BTC,
    epochId: null,
    batchRedeemId: null,
    timestamps: { created: 1000 },
    txHashes: { submit: '0x0' },
    ...overrides,
  }
}

const FIXTURES: VaultRequest[] = [
  makeRequest({ id: 'dep-pending', type: 'deposit', status: 'pending', timestamps: { created: 400 } }),
  makeRequest({ id: 'dep-claimable', type: 'deposit', status: 'claimable', timestamps: { created: 300 } }),
  makeRequest({ id: 'wd-claimable', type: 'withdrawal', status: 'claimable', timestamps: { created: 200 } }),
  makeRequest({ id: 'dep-done', type: 'deposit', status: 'done', timestamps: { created: 100 } }),
  makeRequest({
    id: 'dep-cancelled',
    type: 'deposit',
    status: 'failed',
    failureReason: 'cancelled',
    timestamps: { created: 50 },
  }),
  makeRequest({
    id: 'dep-rejected',
    type: 'deposit',
    status: 'failed',
    failureReason: 'rejected',
    timestamps: { created: 25 },
  }),
]

describe('applyFilters', () => {
  it('returns all requests when no filters provided', () => {
    expect(applyFilters(FIXTURES)).toHaveLength(FIXTURES.length)
    expect(applyFilters(FIXTURES, undefined)).toHaveLength(FIXTURES.length)
  })

  it('filters by type: deposit', () => {
    const result = applyFilters(FIXTURES, { type: ['deposit'] })
    expect(result.every(r => r.type === 'deposit')).toBe(true)
    expect(result).toHaveLength(5)
  })

  it('filters by type: withdrawal', () => {
    const result = applyFilters(FIXTURES, { type: ['withdrawal'] })
    expect(result.every(r => r.type === 'withdrawal')).toBe(true)
    expect(result).toHaveLength(1)
  })

  it('filters by claimToken: rbtc (deposits)', () => {
    const result = applyFilters(FIXTURES, { claimToken: ['rbtc'] })
    expect(result.every(r => r.type === 'deposit')).toBe(true)
  })

  it('filters by claimToken: shares (withdrawals)', () => {
    const result = applyFilters(FIXTURES, { claimToken: ['shares'] })
    expect(result.every(r => r.type === 'withdrawal')).toBe(true)
  })

  it('filters by display status: successful', () => {
    const result = applyFilters(FIXTURES, { status: ['successful'] })
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('dep-done')
  })

  it('filters by display status: cancelled', () => {
    const result = applyFilters(FIXTURES, { status: ['cancelled'] })
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('dep-cancelled')
  })

  it('filters by display status: rejected', () => {
    const result = applyFilters(FIXTURES, { status: ['rejected'] })
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('dep-rejected')
  })

  it('filters by multiple display statuses', () => {
    const result = applyFilters(FIXTURES, { status: ['cancelled', 'rejected'] })
    expect(result).toHaveLength(2)
  })

  it('combines type and status filters', () => {
    const result = applyFilters(FIXTURES, { type: ['deposit'], status: ['pending'] })
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('dep-pending')
  })

  it('returns empty when filters match nothing', () => {
    const result = applyFilters(FIXTURES, { type: ['withdrawal'], status: ['pending'] })
    expect(result).toHaveLength(0)
  })

  it('ignores empty filter arrays', () => {
    const result = applyFilters(FIXTURES, { type: [], status: [] })
    expect(result).toHaveLength(FIXTURES.length)
  })
})

describe('paginate', () => {
  it('returns first page with correct limit', () => {
    const result = paginate(FIXTURES, { page: 1, limit: 2, sortDirection: 'desc' })
    expect(result.data).toHaveLength(2)
    expect(result.total).toBe(FIXTURES.length)
    expect(result.page).toBe(1)
    expect(result.limit).toBe(2)
    expect(result.totalPages).toBe(3)
  })

  it('sorts descending by default (newest first)', () => {
    const result = paginate(FIXTURES, { page: 1, limit: 10, sortDirection: 'desc' })
    const timestamps = result.data.map(r => r.timestamps.created)
    for (let i = 1; i < timestamps.length; i++) {
      expect(timestamps[i]).toBeLessThanOrEqual(timestamps[i - 1])
    }
  })

  it('sorts ascending when requested', () => {
    const result = paginate(FIXTURES, { page: 1, limit: 10, sortDirection: 'asc' })
    const timestamps = result.data.map(r => r.timestamps.created)
    for (let i = 1; i < timestamps.length; i++) {
      expect(timestamps[i]).toBeGreaterThanOrEqual(timestamps[i - 1])
    }
  })

  it('paginates to second page', () => {
    const result = paginate(FIXTURES, { page: 2, limit: 2, sortDirection: 'desc' })
    expect(result.data).toHaveLength(2)
    expect(result.page).toBe(2)
  })

  it('returns empty data for page beyond total', () => {
    const result = paginate(FIXTURES, { page: 100, limit: 10, sortDirection: 'desc' })
    expect(result.data).toHaveLength(0)
    expect(result.total).toBe(FIXTURES.length)
  })

  it('handles limit larger than total items', () => {
    const result = paginate(FIXTURES, { page: 1, limit: 100, sortDirection: 'desc' })
    expect(result.data).toHaveLength(FIXTURES.length)
    expect(result.totalPages).toBe(1)
  })
})
