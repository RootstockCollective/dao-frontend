import { useQuery } from '@tanstack/react-query'
import { toVaultMetricsDisplay } from '../../services/ui/mappers'
import type { VaultMetrics } from '../../services/types'

const ONE_BTC = 10n ** 18n
const BASIS_POINTS_100_PERCENT = 10n ** 9n

const MOCK_METRICS: VaultMetrics = {
  tvl: 50n * ONE_BTC,
  apy: (BASIS_POINTS_100_PERCENT * 85n) / 1000n,
  nav: (ONE_BTC * 102n) / 100n,
  timestamp: Math.floor(Date.now() / 1000),
}

export function useVaultMetrics() {
  return useQuery({
    queryKey: ['btc-vault', 'metrics'],
    queryFn: () => toVaultMetricsDisplay(MOCK_METRICS),
    staleTime: Infinity,
  })
}
