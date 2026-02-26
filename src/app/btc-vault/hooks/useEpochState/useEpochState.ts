import { useQuery } from '@tanstack/react-query'
import { toEpochDisplay } from '../../services/ui/mappers'
import type { EpochState } from '../../services/types'

const ONE_BTC = 10n ** 18n
const now = Math.floor(Date.now() / 1000)

const MOCK_EPOCH: EpochState = {
  epochId: '1',
  status: 'open',
  startTime: now,
  endTime: now + 10,
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
