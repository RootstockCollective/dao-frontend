import { useQuery } from '@tanstack/react-query'
import { toActiveRequestDisplay } from '../../services/ui/mappers'
import type { VaultRequest, ClaimableInfo } from '../../services/types'

const ONE_BTC = 10n ** 18n
const now = Math.floor(Date.now() / 1000)

const MOCK_ACTIVE_REQUEST: VaultRequest = {
  id: 'req-deposit-pending',
  type: 'deposit',
  amount: ONE_BTC / 2n,
  status: 'pending',
  epochId: '1',
  batchRedeemId: null,
  timestamps: { created: now - 60 },
  txHashes: { submit: `0x${'d1'.padStart(64, '0')}` },
}

const MOCK_CLAIMABLE_INFO: ClaimableInfo | null = null

export function useActiveRequests(address: string | undefined) {
  return useQuery({
    queryKey: ['btc-vault', 'active-requests', address],
    queryFn: () => [toActiveRequestDisplay(MOCK_ACTIVE_REQUEST, MOCK_CLAIMABLE_INFO)],
    enabled: !!address,
    staleTime: Infinity,
  })
}
