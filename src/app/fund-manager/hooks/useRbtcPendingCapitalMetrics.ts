import { useMemo } from 'react'
import { type Abi } from 'viem'
import { useReadContracts } from 'wagmi'

import { formatMetrics } from '@/app/shared/formatter'
import { AVERAGE_BLOCKTIME, RBTC } from '@/lib/constants'
import { rbtcAsyncVault } from '@/lib/contracts'
import { usePricesContext } from '@/shared/context/PricesContext'

// TODO: check this comment below
// SAFETY: RBTCAsyncVaultAbi omits `inputs` on parameterless entries,
// which is valid JSON-ABI but violates abitype's strict shape.
const vaultAbi = rbtcAsyncVault.abi as unknown as Abi

const contracts = [
  { address: rbtcAsyncVault.address, abi: vaultAbi, functionName: 'totalPendingDepositAssets' },
  { address: rbtcAsyncVault.address, abi: vaultAbi, functionName: 'totalRedeemRequiredAssets' },
  { address: rbtcAsyncVault.address, abi: vaultAbi, functionName: 'totalRedeemPaidAssets' },
] as const

/**
 * Reads pending capital metrics from the RBTCAsyncVault contract.
 *
 * Mapping:
 * - Pending Deposit Capital → `totalPendingDepositAssets`
 * - Pending Withdrawal Capital → `totalRedeemRequiredAssets - totalRedeemPaidAssets`
 * - Net Pending Capital → pending deposits − pending withdrawals
 */
export function useRbtcPendingCapitalMetrics() {
  const { prices } = usePricesContext()
  const rbtcPrice = prices[RBTC]?.price ?? 0

  const { data, isLoading, error } = useReadContracts({
    contracts,
    query: {
      refetchInterval: AVERAGE_BLOCKTIME,
    },
  })

  return useMemo(() => {
    const totalPendingDeposits = (data?.[0]?.result as bigint | undefined) ?? 0n
    const totalRedeemRequired = (data?.[1]?.result as bigint | undefined) ?? 0n
    const totalRedeemPaid = (data?.[2]?.result as bigint | undefined) ?? 0n

    const pendingWithdrawals = totalRedeemRequired - totalRedeemPaid
    const netPending = totalPendingDeposits - pendingWithdrawals

    return {
      pendingDepositCapital: formatMetrics(totalPendingDeposits, rbtcPrice, RBTC),
      pendingWithdrawalCapital: formatMetrics(pendingWithdrawals, rbtcPrice, RBTC),
      netPendingCapital: formatMetrics(netPending, rbtcPrice, RBTC),
      isLoading,
      error,
    }
  }, [data, rbtcPrice, isLoading, error])
}
