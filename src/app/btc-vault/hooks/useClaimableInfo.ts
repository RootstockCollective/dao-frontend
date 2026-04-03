'use client'

import { useMemo } from 'react'
import type { Address } from 'viem'
import { useReadContracts } from 'wagmi'

import { rbtcVault } from '@/lib/contracts'

import type { ClaimableInfo, VaultRequest } from '../services/types'
import { lockedSharePriceFromEpochSnapshot } from '../services/vaultShareNav'

/**
 * Fetches ClaimableInfo from the contract for a claimable or terminal deposit/withdrawal request.
 * For claimable deposits: claimableDepositRequest + epochSnapshot.
 * For claimable withdrawals: epochSnapshot(batchRedeemId) — rBTC value is derived in the mapper from snapshot totals × row shares.
 * For terminal deposits (done/cancelled/failed): reads only epochSnapshot(epochId) for locked NAV / share display.
 * For terminal withdrawals (done/cancelled/failed): reads epochSnapshot(batchRedeemId) with assets/supply at close for proportional rBTC on the detail page.
 * For wire `displayStatus === 'approved'` (domain `pending`, epoch closed): same snapshot reads as terminal so shares / rBTC can be shown before claimable.
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

  const isTerminalWithdrawal =
    request?.type === 'withdrawal' &&
    (request.status === 'done' || request.status === 'cancelled' || request.status === 'failed') &&
    !!request.batchRedeemId

  const isApprovedDeposit =
    request?.displayStatus === 'approved' && request?.type === 'deposit' && !!request?.epochId

  const isApprovedWithdrawal =
    request?.displayStatus === 'approved' && request?.type === 'withdrawal' && !!request?.batchRedeemId

  const snapshotId =
    isClaimableDeposit || isTerminalDeposit || isApprovedDeposit
      ? BigInt(request!.epochId!)
      : isClaimableWithdrawal || isTerminalWithdrawal || isApprovedWithdrawal
        ? BigInt(request!.batchRedeemId!)
        : 0n

  const enabled =
    (isClaimable || isTerminalDeposit || isTerminalWithdrawal || isApprovedDeposit || isApprovedWithdrawal) &&
    !!address

  const contracts = useMemo(() => {
    if (!enabled) return []

    if (
      (isTerminalDeposit || isTerminalWithdrawal || isApprovedDeposit || isApprovedWithdrawal) &&
      !isClaimable
    ) {
      // Terminal / approved: epochSnapshot(epochId) for deposits, epochSnapshot(batchRedeemId) for withdrawals.
      return [
        {
          ...rbtcVault,
          functionName: 'epochSnapshot' as const,
          args: [snapshotId] as readonly [bigint],
        },
      ]
    }

    const list: Array<
      typeof rbtcVault & { functionName: string; args: readonly [Address] | readonly [bigint] }
    > = isClaimableDeposit
      ? [
          {
            ...rbtcVault,
            functionName: 'claimableDepositRequest' as const,
            args: [address as Address],
          },
          {
            ...rbtcVault,
            functionName: 'epochSnapshot' as const,
            args: [snapshotId],
          },
        ]
      : [
          {
            ...rbtcVault,
            functionName: 'epochSnapshot' as const,
            args: [snapshotId],
          },
        ]
    return list
  }, [
    enabled,
    isClaimable,
    isClaimableDeposit,
    isClaimableWithdrawal,
    isTerminalDeposit,
    isTerminalWithdrawal,
    isApprovedDeposit,
    isApprovedWithdrawal,
    address,
    snapshotId,
  ])

  const { data: rawData } = useReadContracts({
    contracts,
    query: { enabled },
  })

  // SAFETY: narrow type to avoid wagmi's "excessively deep" instantiation in useMemo deps
  const data = rawData as readonly { status: string; result?: unknown }[] | undefined

  return useMemo(() => {
    if (!enabled || !data || data.length === 0) return null

    // Terminal / approved deposits: single epochSnapshot — NAV for share display on deposits
    if ((isTerminalDeposit || isApprovedDeposit) && !isClaimable) {
      if (data[0]?.status !== 'success') return null
      const snap = data[0].result as readonly [bigint, bigint, bigint, bigint]
      const assetsAtClose = snap[1]
      const supplyAtClose = snap[2]
      const navPerShare = lockedSharePriceFromEpochSnapshot(assetsAtClose, supplyAtClose)
      if (navPerShare === 0n) return null
      return { claimable: false, lockedSharePrice: navPerShare }
    }

    // Terminal / approved withdrawals: epochSnapshot — assets/supply for proportional rBTC in mapper
    if ((isTerminalWithdrawal || isApprovedWithdrawal) && !isClaimable) {
      if (data[0]?.status !== 'success') return null
      const snap = data[0].result as readonly [bigint, bigint, bigint, bigint]
      const assetsAtClose = snap[1]
      const supplyAtClose = snap[2]
      const navPerShare = lockedSharePriceFromEpochSnapshot(assetsAtClose, supplyAtClose)
      if (navPerShare === 0n) return null
      return {
        claimable: false,
        lockedSharePrice: navPerShare,
        assetsAtCloseWei: assetsAtClose,
        supplyAtCloseWei: supplyAtClose,
      }
    }

    // Claimable deposits: claimable amount + epochSnapshot
    if (isClaimableDeposit) {
      if (data.length < 2) return null
      const firstResult = (data[0]?.status === 'success' ? data[0].result : 0n) as bigint
      if (firstResult === 0n) return null
      if (data[1]?.status !== 'success') return null
      const snap = data[1].result as readonly [bigint, bigint, bigint, bigint]
      const assetsAtClose = snap[1]
      const supplyAtClose = snap[2]
      const navPerShare = lockedSharePriceFromEpochSnapshot(assetsAtClose, supplyAtClose)
      if (navPerShare === 0n) return null
      return {
        claimable: true,
        lockedSharePrice: navPerShare,
        assetsAtCloseWei: assetsAtClose,
        supplyAtCloseWei: supplyAtClose,
      }
    }

    // Claimable withdrawals: epochSnapshot only (proportional rBTC in mapper)
    if (data.length < 1) return null
    if (data[0]?.status !== 'success') return null
    const snap = data[0].result as readonly [bigint, bigint, bigint, bigint]
    const assetsAtClose = snap[1]
    const supplyAtClose = snap[2]
    const navPerShare = lockedSharePriceFromEpochSnapshot(assetsAtClose, supplyAtClose)
    if (navPerShare === 0n) return null

    return {
      claimable: true,
      lockedSharePrice: navPerShare,
      assetsAtCloseWei: assetsAtClose,
      supplyAtCloseWei: supplyAtClose,
    }
  }, [
    enabled,
    isClaimable,
    isClaimableDeposit,
    isClaimableWithdrawal,
    isTerminalDeposit,
    isTerminalWithdrawal,
    isApprovedDeposit,
    isApprovedWithdrawal,
    data,
  ])
}
