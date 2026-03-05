import { useQuery } from '@tanstack/react-query'

import type { VaultRequest } from '../../services/types'

// TODO(DAO-XXXX): Remove mock data once contract integration is in place
const ONE_BTC = 10n ** 18n
const now = Math.floor(Date.now() / 1000)
const pastTime = now - 3600

function mockTxHash(suffix: string): string {
  return `0x${suffix.padStart(64, '0')}`
}

const MOCK_REQUESTS: VaultRequest[] = [
  {
    id: 'req-deposit-pending',
    type: 'deposit',
    amount: ONE_BTC / 2n,
    status: 'pending',
    epochId: '1',
    batchRedeemId: null,
    timestamps: { created: now - 60 },
    txHashes: { submit: mockTxHash('d1') },
  },
  {
    id: 'req-deposit-claimable',
    type: 'deposit',
    amount: ONE_BTC,
    status: 'claimable',
    epochId: '0',
    batchRedeemId: null,
    timestamps: { created: pastTime, updated: pastTime + 600 },
    txHashes: { submit: mockTxHash('d2') },
  },
  {
    id: 'req-deposit-done',
    type: 'deposit',
    amount: 2n * ONE_BTC,
    status: 'done',
    epochId: '0',
    batchRedeemId: null,
    timestamps: { created: pastTime - 7200, updated: pastTime - 6600, finalized: pastTime - 6000 },
    txHashes: { submit: mockTxHash('d3'), finalize: mockTxHash('d3f') },
  },
  {
    id: 'req-deposit-failed',
    type: 'deposit',
    amount: ONE_BTC / 4n,
    status: 'failed',
    epochId: '0',
    batchRedeemId: null,
    timestamps: { created: pastTime - 3600, updated: pastTime - 3000 },
    txHashes: { submit: mockTxHash('d4') },
  },
  {
    id: 'req-withdrawal-pending',
    type: 'withdrawal',
    amount: ONE_BTC / 2n,
    status: 'pending',
    epochId: null,
    batchRedeemId: 'batch-1',
    timestamps: { created: now - 30 },
    txHashes: { submit: mockTxHash('w1') },
  },
  {
    id: 'req-withdrawal-claimable',
    type: 'withdrawal',
    amount: ONE_BTC,
    status: 'claimable',
    epochId: null,
    batchRedeemId: 'batch-0',
    timestamps: { created: pastTime, updated: pastTime + 600 },
    txHashes: { submit: mockTxHash('w2') },
  },
  {
    id: 'req-withdrawal-done',
    type: 'withdrawal',
    amount: (3n * ONE_BTC) / 2n,
    status: 'done',
    epochId: null,
    batchRedeemId: 'batch-0',
    timestamps: { created: pastTime - 7200, updated: pastTime - 6600, finalized: pastTime - 6000 },
    txHashes: { submit: mockTxHash('w3'), finalize: mockTxHash('w3f') },
  },
  {
    id: 'req-withdrawal-failed',
    type: 'withdrawal',
    amount: ONE_BTC / 4n,
    status: 'failed',
    epochId: null,
    batchRedeemId: 'batch-0',
    timestamps: { created: pastTime - 3600, updated: pastTime - 3000 },
    txHashes: { submit: mockTxHash('w4') },
  },
]

/**
 * Returns a single VaultRequest by ID from mock data.
 * Returns null when no request matches the given ID.
 */
export function useRequestById(id: string | undefined) {
  return useQuery({
    queryKey: ['btc-vault', 'request', id],
    queryFn: () => MOCK_REQUESTS.find(r => r.id === id) ?? null,
    enabled: !!id,
    staleTime: Infinity,
  })
}
