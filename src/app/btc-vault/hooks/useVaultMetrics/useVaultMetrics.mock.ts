import { useQuery } from '@tanstack/react-query'
import { useMockBtcVaultAdapter } from '../../providers/MockBtcVaultProvider'
import { toVaultMetricsDisplay } from '../../services/ui/mappers'

/**
 * Fetches vault metrics (TVL, APY, NAV) and returns display-formatted values.
 * @returns React Query result containing {@link VaultMetricsDisplay}
 */
export function useVaultMetricsMock() {
  const adapter = useMockBtcVaultAdapter()

  return useQuery({
    queryKey: ['btc-vault', 'metrics'],
    queryFn: async () => {
      const raw = await adapter.getVaultMetrics()
      return toVaultMetricsDisplay(raw)
    },
  })
}
