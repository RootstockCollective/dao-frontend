import { describe, expect, it } from 'vitest'

import { paginateSortedBlockscoutNavRows } from './blockscoutPagination'
import type { BtcVaultNavHistoryItem } from './types'

function r(
  overrides: Partial<BtcVaultNavHistoryItem> & Pick<
    BtcVaultNavHistoryItem,
    'id' | 'processedAt' | 'requestsProcessedInEpoch'
  >,
): BtcVaultNavHistoryItem {
  return {
    epochId: 1,
    reportedOffchainAssets: '0',
    blockNumber: 1,
    transactionHash: '0xh',
    deposits: [],
    redeems: [],
    ...overrides,
  }
}

describe('paginateSortedBlockscoutNavRows', () => {
  const unsorted: BtcVaultNavHistoryItem[] = [
    r({ id: 'hi', processedAt: 999, requestsProcessedInEpoch: 1 }),
    r({ id: 'lo', processedAt: 111, requestsProcessedInEpoch: 1 }),
    r({ id: 'mid', processedAt: 500, requestsProcessedInEpoch: 5 }),
  ]

  it('sorts by processedAt asc then slices offset for page/limit', () => {
    const { data, total } = paginateSortedBlockscoutNavRows(unsorted, {
      page: 2,
      limit: 1,
      sort_field: 'processedAt',
      sort_direction: 'asc',
    })

    expect(total).toBe(3)
    expect(data).toHaveLength(1)
    expect(data[0].id).toBe('mid')
  })

  it('sorts by requestsProcessedInEpoch desc across full set before slicing', () => {
    const { data, total } = paginateSortedBlockscoutNavRows(
      [
        r({ id: 'light', processedAt: 400, requestsProcessedInEpoch: 2 }),
        r({ id: 'heavy', processedAt: 100, requestsProcessedInEpoch: 99 }),
      ],
      {
        page: 1,
        limit: 1,
        sort_field: 'requestsProcessedInEpoch',
        sort_direction: 'desc',
      },
    )

    expect(total).toBe(2)
    expect(data).toHaveLength(1)
    expect(data[0].id).toBe('heavy')
  })
})
