import { useQuery } from '@tanstack/react-query'

import type { VaultMetrics } from '../../services/types'
import { toVaultMetricsDisplay } from '../../services/ui/mappers'

interface VaultMetricsResponse {
  tvl: string
  apy: string
  pricePerShare: string
  totalSupply: string
  timestamp: number
}

async function fetchVaultMetrics(): Promise<VaultMetrics> {
  const res = await fetch('/api/btc-vault/metrics')
  if (!res.ok) throw new Error(`Failed to fetch vault metrics: ${res.status}`)
  const json: VaultMetricsResponse = await res.json()
  return {
    tvl: BigInt(json.tvl),
    apy: BigInt(json.apy),
    pricePerShare: BigInt(json.pricePerShare),
    timestamp: json.timestamp,
  }
}

export function useVaultMetrics() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['btc-vault', 'metrics'],
    queryFn: fetchVaultMetrics,
    refetchInterval: 20_000,
  })

  return {
    data: data ? toVaultMetricsDisplay(data) : null,
    raw: data ?? null,
    isLoading,
    error,
    refetch,
  }
}
