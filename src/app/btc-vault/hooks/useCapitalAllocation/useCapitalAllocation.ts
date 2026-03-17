import { useMemo } from 'react'
import { useReadContracts } from 'wagmi'

import { RBTC } from '@/lib/constants'
import { rbtcVault } from '@/lib/contracts'
import { usePricesContext } from '@/shared/context/PricesContext'

import type { CapitalAllocation } from '../../services/types'
import { toCapitalAllocationDisplay } from '../../services/ui/mappers'

const CAPITAL_ALLOCATION_CONTRACTS = [
  { ...rbtcVault, functionName: 'totalAssets' } as const,
  { ...rbtcVault, functionName: 'freeOnchainLiquidity' } as const,
  { ...rbtcVault, functionName: 'reservedOnchainAssets' } as const,
  { ...rbtcVault, functionName: 'reportedOffchainAssets' } as const,
] as const

// TODO: Wallet addresses and balances will be provided by a future backend/API integration.
const MOCK_WALLETS: CapitalAllocation['wallets'] = []

export function useCapitalAllocation() {
  const { prices } = usePricesContext()
  const rbtcPrice = prices[RBTC]?.price ?? 0

  const { data, isLoading, error } = useReadContracts({
    contracts: CAPITAL_ALLOCATION_CONTRACTS,
    query: {
      refetchInterval: 60_000,
    },
  })

  const rawAllocation = useMemo((): CapitalAllocation => {
    const totalAssets = (data?.[0]?.result as bigint | undefined) ?? 0n
    const freeOnchainLiquidity = (data?.[1]?.result as bigint | undefined) ?? 0n
    const reservedOnchainAssets = (data?.[2]?.result as bigint | undefined) ?? 0n
    const reportedOffchainAssets = (data?.[3]?.result as bigint | undefined) ?? 0n

    return {
      categories: [
        { label: 'Deployed capital', amount: reportedOffchainAssets },
        { label: 'Liquidity reserve', amount: freeOnchainLiquidity },
        { label: 'Unallocated capital', amount: reservedOnchainAssets },
      ],
      totalCapital: totalAssets,
      wallets: MOCK_WALLETS,
    }
  }, [data])

  const display = useMemo(() => {
    if (isLoading || error) return
    return toCapitalAllocationDisplay(rawAllocation, rbtcPrice)
  }, [rawAllocation, rbtcPrice, isLoading, error])

  return {
    data: display,
    isLoading,
    isError: !!error,
  }
}
