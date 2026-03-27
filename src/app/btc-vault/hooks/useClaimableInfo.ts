'use client'

import { useMemo } from 'react'
import type { Address } from 'viem'
import { useReadContracts } from 'wagmi'

import { rbtcVault } from '@/lib/contracts'

import type { ClaimableInfo, VaultRequest } from '../services/types'

const WEI_PER_ETHER = 10n ** 18n

/**
 * Fetches ClaimableInfo from the contract for a claimable request (deposit or withdrawal).
 * Reads the appropriate claimable function + epochSnapshot to derive lockedSharePrice (NAV per share).
 * Returns null for non-claimable requests or when epoch data is unavailable.
 */
export function useClaimableInfo(
  request: VaultRequest | null,
  address: string | undefined,
): ClaimableInfo | null {
  const isClaimableDeposit =
    request?.type === 'deposit' && request.status === 'claimable' && !!request.epochId
  const isClaimableWithdrawal =
    request?.type === 'withdrawal' && request.status === 'claimable' && !!request.batchRedeemId
  const isClaimable = isClaimableDeposit || isClaimableWithdrawal

  const snapshotId = isClaimableDeposit
    ? BigInt(request!.epochId!)
    : isClaimableWithdrawal
      ? BigInt(request!.batchRedeemId!)
      : 0n

  const contracts = useMemo(() => {
    if (!isClaimable || !address) return []
    const claimFn = isClaimableDeposit ? 'claimableDepositRequest' : 'claimableRedeemRequest'
    const list: Array<
      typeof rbtcVault & { functionName: string; args: readonly [Address] | readonly [bigint] }
    > = [
      {
        ...rbtcVault,
        functionName: claimFn,
        args: [address as Address],
      },
      {
        ...rbtcVault,
        functionName: 'epochSnapshot' as const,
        args: [snapshotId],
      },
    ]
    return list
  }, [isClaimable, isClaimableDeposit, address, snapshotId])

  const { data: rawData } = useReadContracts({
    contracts,
    query: { enabled: isClaimable && !!address },
  })

  // SAFETY: narrow type to avoid wagmi's "excessively deep" instantiation in useMemo deps
  const data = rawData as readonly { status: string; result?: unknown }[] | undefined

  return useMemo(() => {
    if (!isClaimable || !data || data.length < 2) return null

    const claimableAmount = (data[0]?.status === 'success' ? data[0].result : 0n) as bigint
    if (claimableAmount === 0n) return null

    if (data[1]?.status !== 'success') return null
    const snap = data[1].result as readonly [bigint, bigint, bigint, bigint]
    const assetsAtClose = snap[1]
    const supplyAtClose = snap[2]
    const navPerShare =
      supplyAtClose + 1n > 0n ? ((assetsAtClose + 1n) * WEI_PER_ETHER) / (supplyAtClose + 1n) : 0n

    if (navPerShare === 0n) return null
    return { claimable: true, lockedSharePrice: navPerShare }
  }, [isClaimable, data])
}
