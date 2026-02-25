import { useVaultMetricsMock } from './useVaultMetrics.mock'
import { useVaultMetricsContract } from './useVaultMetrics.contract'

export const useVaultMetrics =
  process.env.NEXT_PUBLIC_BTC_VAULT_DATA_SOURCE === 'contract' ? useVaultMetricsContract : useVaultMetricsMock
