'use client'

import { useMemo } from 'react'
import type { Address } from 'viem'
import { useReadContracts } from 'wagmi'

import { rbtcVault } from '@/lib/contracts'

import type { ClaimableInfo, VaultRequest } from '../services/types'

const WEI_PER_ETHER = 10n ** 18n

/**
 * Fetches ClaimableInfo from the contract for a claimable or terminal deposit/withdrawal request.
 * For claimable requests: reads the claimable function + epochSnapshot to derive lockedSharePrice.
 * For terminal deposits (done/cancelled/failed): reads only epochSnapshot so the detail page
 * can still display the shares count.
 * Returns null for pending requests or when epoch data is unavailable.
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

  const isTerminalDeposit =
    request?.type === 'deposit' &&
    (request.status === 'done' || request.status === 'cancelled' || request.status === 'failed') &&
    !!request.epochId

  const snapshotId = isClaimableDeposit
    ? BigInt(request!.epochId!)
    : isClaimableWithdrawal
      ? BigInt(request!.batchRedeemId!)
      : isTerminalDeposit
        ? BigInt(request!.epochId!)
        : 0n

  const enabled = (isClaimable || isTerminalDeposit) && !!address

  const contracts = useMemo(() => {
    if (!enabled) return []

    if (isTerminalDeposit && !isClaimable) {
      // Terminal deposits: only need epochSnapshot (claimable amount is 0 post-claim)
      return [
        {
          ...rbtcVault,
          functionName: 'epochSnapshot' as const,
          args: [snapshotId] as readonly [bigint],
        },
      ]
    }

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
  }, [enabled, isClaimable, isClaimableDeposit, isTerminalDeposit, address, snapshotId])

  const { data: rawData } = useReadContracts({
    contracts,
    query: { enabled },
  })

  // SAFETY: narrow type to avoid wagmi's "excessively deep" instantiation in useMemo deps
  const data = rawData as readonly { status: string; result?: unknown }[] | undefined

  return useMemo(() => {
    if (!enabled || !data || data.length === 0) return null

    // Terminal deposits: single contract call (epochSnapshot only)
    if (isTerminalDeposit && !isClaimable) {
      if (data[0]?.status !== 'success') return null
      const snap = data[0].result as readonly [bigint, bigint, bigint, bigint]
      const assetsAtClose = snap[1]
      const supplyAtClose = snap[2]
      const navPerShare =
        supplyAtClose + 1n > 0n ? ((assetsAtClose + 1n) * WEI_PER_ETHER) / (supplyAtClose + 1n) : 0n
      if (navPerShare === 0n) return null
      return { claimable: false, lockedSharePrice: navPerShare }
    }

    // Claimable requests: two contract calls (claimable amount + epochSnapshot)
    if (data.length < 2) return null

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
  }, [enabled, isClaimable, isTerminalDeposit, data])
}
