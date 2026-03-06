import { useQuery } from '@tanstack/react-query'

import type { PaginatedResult, PaginationParams, VaultRequest } from '../../services/types'
import { mapRequestDisplayStatus, toPaginatedHistoryDisplay } from '../../services/ui/mappers'
import type { HistoryFilterParams } from '../../services/ui/types'

// TODO(DAO-XXXX): Remove mock data once contract integration is in place
const ONE_BTC = 10n ** 18n

/**
 * Returns a Unix timestamp (seconds) for a point in the past relative to now.
 * Used to generate realistic mock timestamps for history entries.
 */
function unixSecondsAgo(daysAgo: number, hoursAgo = 0): number {
  return Math.floor(Date.now() / 1000) - daysAgo * 86400 - hoursAgo * 3600
}

function mockTxHash(suffix: string): string {
  return `0x${suffix.padStart(64, '0')}`
}

const MOCK_REQUESTS: VaultRequest[] = [
  {
    id: 'req-dep-open-1',
    type: 'deposit',
    amount: ONE_BTC,
    status: 'claimable',
    epochId: '5',
    batchRedeemId: null,
    timestamps: { created: unixSecondsAgo(10), updated: unixSecondsAgo(8) },
    txHashes: { submit: mockTxHash('d01') },
  },
  {
    id: 'req-dep-pending-1',
    type: 'deposit',
    amount: (3n * ONE_BTC) / 2n,
    status: 'pending',
    epochId: '6',
    batchRedeemId: null,
    timestamps: { created: unixSecondsAgo(11) },
    txHashes: { submit: mockTxHash('d02') },
  },
  {
    id: 'req-wd-claim-1',
    type: 'withdrawal',
    amount: 600n * ONE_BTC,
    status: 'claimable',
    epochId: null,
    batchRedeemId: 'batch-5',
    timestamps: { created: unixSecondsAgo(53), updated: unixSecondsAgo(50) },
    txHashes: { submit: mockTxHash('w01') },
  },
  {
    id: 'req-wd-open-1',
    type: 'withdrawal',
    amount: 600n * ONE_BTC,
    status: 'claimable',
    epochId: null,
    batchRedeemId: 'batch-4',
    timestamps: { created: unixSecondsAgo(53), updated: unixSecondsAgo(51) },
    txHashes: { submit: mockTxHash('w02') },
  },
  {
    id: 'req-wd-pending-1',
    type: 'withdrawal',
    amount: 600n * ONE_BTC,
    status: 'pending',
    epochId: null,
    batchRedeemId: 'batch-6',
    timestamps: { created: unixSecondsAgo(53) },
    txHashes: { submit: mockTxHash('w03') },
  },
  {
    id: 'req-dep-done-1',
    type: 'deposit',
    amount: 2n * ONE_BTC,
    status: 'done',
    epochId: '3',
    batchRedeemId: null,
    timestamps: { created: unixSecondsAgo(53), updated: unixSecondsAgo(52), finalized: unixSecondsAgo(51) },
    txHashes: { submit: mockTxHash('d03'), finalize: mockTxHash('d03f') },
  },
  {
    id: 'req-dep-cancelled-1',
    type: 'deposit',
    amount: ONE_BTC / 4n,
    status: 'failed',
    failureReason: 'cancelled',
    epochId: '2',
    batchRedeemId: null,
    timestamps: { created: unixSecondsAgo(73), updated: unixSecondsAgo(72) },
    txHashes: { submit: mockTxHash('d04') },
  },
  {
    id: 'req-dep-rejected-1',
    type: 'deposit',
    amount: ONE_BTC / 2n,
    status: 'failed',
    failureReason: 'rejected',
    epochId: '1',
    batchRedeemId: null,
    timestamps: { created: unixSecondsAgo(93), updated: unixSecondsAgo(92) },
    txHashes: { submit: mockTxHash('d05') },
  },
  {
    id: 'req-wd-done-1',
    type: 'withdrawal',
    amount: 1200n * ONE_BTC,
    status: 'done',
    epochId: null,
    batchRedeemId: 'batch-3',
    timestamps: { created: unixSecondsAgo(93), updated: unixSecondsAgo(92), finalized: unixSecondsAgo(91) },
    txHashes: { submit: mockTxHash('w04'), finalize: mockTxHash('w04f') },
  },
  {
    id: 'req-wd-done-2',
    type: 'withdrawal',
    amount: 1200n * ONE_BTC,
    status: 'done',
    epochId: null,
    batchRedeemId: 'batch-2',
    timestamps: {
      created: unixSecondsAgo(93, 1),
      updated: unixSecondsAgo(92, 1),
      finalized: unixSecondsAgo(91, 1),
    },
    txHashes: { submit: mockTxHash('w05'), finalize: mockTxHash('w05f') },
  },
  {
    id: 'req-wd-done-3',
    type: 'withdrawal',
    amount: 1200n * ONE_BTC,
    status: 'done',
    epochId: null,
    batchRedeemId: 'batch-1',
    timestamps: {
      created: unixSecondsAgo(93, 2),
      updated: unixSecondsAgo(92, 2),
      finalized: unixSecondsAgo(91, 2),
    },
    txHashes: { submit: mockTxHash('w06'), finalize: mockTxHash('w06f') },
  },
  {
    id: 'req-dep-done-2',
    type: 'deposit',
    amount: (5n * ONE_BTC) / 2n,
    status: 'done',
    epochId: '0',
    batchRedeemId: null,
    timestamps: {
      created: unixSecondsAgo(93, 3),
      updated: unixSecondsAgo(92, 3),
      finalized: unixSecondsAgo(91, 3),
    },
    txHashes: { submit: mockTxHash('d06'), finalize: mockTxHash('d06f') },
  },
  {
    id: 'req-dep-done-3',
    type: 'deposit',
    amount: 3n * ONE_BTC,
    status: 'done',
    epochId: '0',
    batchRedeemId: null,
    timestamps: {
      created: unixSecondsAgo(93, 4),
      updated: unixSecondsAgo(92, 4),
      finalized: unixSecondsAgo(91, 4),
    },
    txHashes: { submit: mockTxHash('d07'), finalize: mockTxHash('d07f') },
  },
  {
    id: 'req-dep-done-4',
    type: 'deposit',
    amount: ONE_BTC / 10n,
    status: 'done',
    epochId: '0',
    batchRedeemId: null,
    timestamps: {
      created: unixSecondsAgo(93, 5),
      updated: unixSecondsAgo(92, 5),
      finalized: unixSecondsAgo(91, 5),
    },
    txHashes: { submit: mockTxHash('d08'), finalize: mockTxHash('d08f') },
  },
]

/** @internal Exported for testing. Will be removed when Feature 9 wires real backend. */
export function applyFilters(requests: VaultRequest[], filters?: HistoryFilterParams): VaultRequest[] {
  if (!filters) return requests

  let filtered = requests

  const { type, claimToken, status } = filters

  if (type?.length) {
    filtered = filtered.filter(r => type.includes(r.type))
  }

  if (claimToken?.length) {
    filtered = filtered.filter(r => {
      const tokenType = r.type === 'deposit' ? 'rbtc' : 'shares'
      return claimToken.includes(tokenType)
    })
  }

  if (status?.length) {
    filtered = filtered.filter(r => {
      const { displayStatus } = mapRequestDisplayStatus(r.status, r.type, r.failureReason)
      return status.includes(displayStatus)
    })
  }

  return filtered
}

/** @internal Exported for testing. Will be removed when Feature 9 wires real backend. */
export function paginate(requests: VaultRequest[], params: PaginationParams): PaginatedResult<VaultRequest> {
  const sorted = [...requests].sort((a, b) => {
    const dir = params.sortDirection === 'asc' ? 1 : -1
    return dir * (a.timestamps.created - b.timestamps.created)
  })
  const start = (params.page - 1) * params.limit
  return {
    data: sorted.slice(start, start + params.limit),
    total: requests.length,
    page: params.page,
    limit: params.limit,
    totalPages: Math.ceil(requests.length / params.limit),
  }
}

/**
 * Fetches paginated, filtered, and sorted request history for the BTC vault.
 * Currently backed by mock data; Feature 9 will wire the real data layer.
 * @param address - Connected wallet address; query is disabled when undefined
 * @param params - Pagination and sort parameters
 * @param filters - Optional filter criteria (type, claim token, display status)
 */
export function useRequestHistory(
  address: string | undefined,
  params: PaginationParams,
  filters?: HistoryFilterParams,
) {
  return useQuery({
    queryKey: ['btc-vault', 'history', address, params, filters],
    queryFn: () => toPaginatedHistoryDisplay(paginate(applyFilters(MOCK_REQUESTS, filters), params)),
    enabled: !!address,
    staleTime: Infinity,
  })
}
