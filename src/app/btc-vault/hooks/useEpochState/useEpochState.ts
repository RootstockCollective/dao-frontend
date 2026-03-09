import { useQuery } from '@tanstack/react-query'

import type { EpochState } from '../../services/types'
import { toEpochDisplay } from '../../services/ui/mappers'

const ONE_BTC = 10n ** 18n
const now = Math.floor(Date.now() / 1000)

const SIX_DAYS_SEC = 6 * 24 * 3600

const MOCK_EPOCH: EpochState = {
  epochId: '1',
  status: 'open',
  startTime: now,
  endTime: now + SIX_DAYS_SEC,
  settledAt: null,
  navPerShare: null,
  totalDepositAssets: 5n * ONE_BTC,
  totalRedemptionShares: 2n * ONE_BTC,
}

export function useEpochState() {
  return useQuery({
    queryKey: ['btc-vault', 'epoch'],
    queryFn: () => toEpochDisplay(MOCK_EPOCH),
    staleTime: Infinity,
  })
}
