import { beforeEach, describe, expect, it, vi } from 'vitest'

import { aggregateItems, fetchUserPrincipal } from './action'

const mockFetchClaimedItemsFromTheGraph = vi.fn()
const mockFetchClaimedItemsFromBlockscout = vi.fn()

vi.mock('./fetchClaimedItemsFromTheGraph', () => ({
  fetchClaimedItemsFromTheGraph: (...args: unknown[]) => mockFetchClaimedItemsFromTheGraph(...args),
}))

vi.mock('./fetchClaimedItemsFromBlockscout', () => ({
  fetchClaimedItemsFromBlockscout: (...args: unknown[]) => mockFetchClaimedItemsFromBlockscout(...args),
}))

const ONE_ETHER = 1_000_000_000_000_000_000n

function makeItem(action: string, assets: bigint, user = '0xuser') {
  return {
    id: `${Math.random()}`,
    user,
    action,
    assets: assets.toString(),
    shares: '0',
    epochId: '1',
    timestamp: 1000,
    blockNumber: '100',
    transactionHash: '0xabc',
  }
}

describe('aggregateItems', () => {
  it('returns 0n principal and empty events for empty array', () => {
    const result = aggregateItems([])
    expect(result.principal).toBe(0n)
    expect(result.events).toEqual([])
  })

  it('sums deposits and returns events', () => {
    const items = [makeItem('DEPOSIT_CLAIMED', 2n * ONE_ETHER), makeItem('DEPOSIT_CLAIMED', 3n * ONE_ETHER)]
    const result = aggregateItems(items)
    expect(result.principal).toBe(5n * ONE_ETHER)
    expect(result.events).toHaveLength(2)
    expect(result.events[0].type).toBe('deposit')
    expect(result.events[0].amount).toBe((2n * ONE_ETHER).toString())
  })

  it('subtracts withdrawals from deposits', () => {
    const items = [makeItem('DEPOSIT_CLAIMED', 10n * ONE_ETHER), makeItem('REDEEM_CLAIMED', 3n * ONE_ETHER)]
    const result = aggregateItems(items)
    expect(result.principal).toBe(7n * ONE_ETHER)
    expect(result.events).toHaveLength(2)
    expect(result.events[1].type).toBe('withdrawal')
  })

  it('clamps negative principal to 0n', () => {
    const items = [makeItem('DEPOSIT_CLAIMED', ONE_ETHER), makeItem('REDEEM_CLAIMED', 5n * ONE_ETHER)]
    const result = aggregateItems(items)
    expect(result.principal).toBe(0n)
    expect(result.events).toHaveLength(2)
  })

  it('ignores non-claimed actions', () => {
    const items = [
      makeItem('DEPOSIT_CLAIMED', 5n * ONE_ETHER),
      makeItem('DEPOSIT_REQUEST', 100n * ONE_ETHER),
    ]
    const result = aggregateItems(items)
    expect(result.principal).toBe(5n * ONE_ETHER)
    expect(result.events).toHaveLength(1)
  })

  it('includes timestamp and transactionHash in events', () => {
    const items = [makeItem('DEPOSIT_CLAIMED', ONE_ETHER)]
    const result = aggregateItems(items)
    expect(result.events[0]).toEqual({
      type: 'deposit',
      amount: ONE_ETHER.toString(),
      timestamp: 1000,
      transactionHash: '0xabc',
    })
  })
})

describe('fetchUserPrincipal', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('The Graph (primary)', () => {
    it('returns principal and events from The Graph', async () => {
      mockFetchClaimedItemsFromTheGraph.mockResolvedValue([
        makeItem('DEPOSIT_CLAIMED', 5n * ONE_ETHER),
        makeItem('REDEEM_CLAIMED', 2n * ONE_ETHER),
      ])

      const result = await fetchUserPrincipal('0xuser')

      expect(result.principal).toBe(3n * ONE_ETHER)
      expect(result.events).toHaveLength(2)
      expect(result.source).toBe('the-graph')
      expect(mockFetchClaimedItemsFromBlockscout).not.toHaveBeenCalled()
    })

    it('returns 0n when no history exists', async () => {
      mockFetchClaimedItemsFromTheGraph.mockResolvedValue([])

      const result = await fetchUserPrincipal('0xuser')

      expect(result.principal).toBe(0n)
      expect(result.events).toEqual([])
      expect(result.source).toBe('the-graph')
    })
  })

  describe('Blockscout (fallback)', () => {
    beforeEach(() => {
      mockFetchClaimedItemsFromTheGraph.mockRejectedValue(new Error('Subgraph down'))
    })

    it('falls back to Blockscout when The Graph fails', async () => {
      mockFetchClaimedItemsFromBlockscout.mockResolvedValue([
        makeItem('DEPOSIT_CLAIMED', 5n * ONE_ETHER),
      ])

      const result = await fetchUserPrincipal('0xuser')

      expect(result.principal).toBe(5n * ONE_ETHER)
      expect(result.events).toHaveLength(1)
      expect(result.source).toBe('blockscout')
    })

    it('returns 0n with source none when both sources fail', async () => {
      mockFetchClaimedItemsFromBlockscout.mockRejectedValue(new Error('Blockscout down'))

      const result = await fetchUserPrincipal('0xuser')

      expect(result.principal).toBe(0n)
      expect(result.events).toEqual([])
      expect(result.source).toBe('none')
    })
  })
})
