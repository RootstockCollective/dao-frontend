import { describe, expect, it } from 'vitest'
import { filterSortPaginateStakingHistory, filterSortStakingHistoryGroups } from './query'
import type { StakingHistoryByPeriodAndAction } from '../../types'

const addr = '0xa18f4fbee88592bee3d51d90ba791e769a9b902f'

function group(
  period: string,
  action: 'STAKE' | 'UNSTAKE',
  amount: string,
  txs: { ts: number; amt: string }[],
): StakingHistoryByPeriodAndAction {
  return {
    period,
    action,
    amount,
    transactions: txs.map((t, i) => ({
      user: addr,
      action,
      amount: t.amt,
      blockNumber: String(i),
      blockHash: null,
      timestamp: t.ts,
      transactionHash: `0x${i.toString(16).padStart(64, '0')}`,
    })),
  }
}

describe('filterSortStakingHistoryGroups', () => {
  it('matches full list from paginate with large limit', () => {
    const groups: StakingHistoryByPeriodAndAction[] = [
      group('2025-01', 'STAKE', '10', [{ ts: 100, amt: '10' }]),
      group('2025-02', 'STAKE', '5', [{ ts: 101, amt: '5' }]),
    ]
    const sorted = filterSortStakingHistoryGroups(groups, {
      sort_field: 'period',
      sort_direction: 'desc',
    })
    const { data } = filterSortPaginateStakingHistory(groups, {
      sort_field: 'period',
      sort_direction: 'desc',
      limit: 99,
      offset: 0,
    })
    expect(sorted).toEqual(data)
  })
})

describe('filterSortPaginateStakingHistory', () => {
  it('filters by stake only', () => {
    const groups: StakingHistoryByPeriodAndAction[] = [
      group('2025-01', 'STAKE', '10', [{ ts: 100, amt: '10' }]),
      group('2025-01', 'UNSTAKE', '5', [{ ts: 101, amt: '5' }]),
    ]
    const { data, total } = filterSortPaginateStakingHistory(groups, {
      type: ['stake'],
      sort_field: 'period',
      sort_direction: 'desc',
      limit: 20,
      offset: 0,
    })
    expect(total).toBe(1)
    expect(data).toHaveLength(1)
    expect(data[0].action).toBe('STAKE')
  })

  it('paginates with correct total', () => {
    const groups: StakingHistoryByPeriodAndAction[] = [
      group('2025-03', 'STAKE', '1', [{ ts: 1, amt: '1' }]),
      group('2025-02', 'STAKE', '1', [{ ts: 2, amt: '1' }]),
      group('2025-01', 'STAKE', '1', [{ ts: 3, amt: '1' }]),
    ]
    const { data, total } = filterSortPaginateStakingHistory(groups, {
      sort_field: 'period',
      sort_direction: 'desc',
      limit: 2,
      offset: 1,
    })
    expect(total).toBe(3)
    expect(data).toHaveLength(2)
    expect(data.map(d => d.period)).toEqual(['2025-02', '2025-01'])
  })

  it('sorts groups by amount', () => {
    const groups: StakingHistoryByPeriodAndAction[] = [
      group('2025-01', 'STAKE', '100', [{ ts: 1, amt: '100' }]),
      group('2025-02', 'STAKE', '50', [{ ts: 2, amt: '50' }]),
    ]
    const { data } = filterSortPaginateStakingHistory(groups, {
      sort_field: 'amount',
      sort_direction: 'asc',
      limit: 10,
      offset: 0,
    })
    expect(data.map(g => g.amount)).toEqual(['50', '100'])
  })

  it('orders transactions inside each group by sort_direction', () => {
    const groups: StakingHistoryByPeriodAndAction[] = [
      {
        period: '2025-01',
        action: 'STAKE',
        amount: '30',
        transactions: [
          {
            user: addr,
            action: 'STAKE',
            amount: '10',
            blockNumber: '1',
            blockHash: null,
            timestamp: 300,
            transactionHash: '0x1',
          },
          {
            user: addr,
            action: 'STAKE',
            amount: '20',
            blockNumber: '2',
            blockHash: null,
            timestamp: 100,
            transactionHash: '0x2',
          },
        ],
      },
    ]
    const { data } = filterSortPaginateStakingHistory(groups, {
      sort_field: 'period',
      sort_direction: 'asc',
      limit: 10,
      offset: 0,
    })
    expect(data[0].transactions.map(t => Number(t.timestamp))).toEqual([100, 300])
  })
})
