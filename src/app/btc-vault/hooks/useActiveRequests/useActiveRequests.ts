'use client'

import { useMemo } from 'react'
import type { Address } from 'viem'
import { zeroAddress } from 'viem'
import { useReadContracts } from 'wagmi'

import { RBTC } from '@/lib/constants'
import { rbtcVault } from '@/lib/contracts'
import { usePricesContext } from '@/shared/context/PricesContext'

import type { ClaimableInfo, VaultRequest } from '../../services/types'
import { toActiveRequestDisplay } from '../../services/ui/mappers'
import type { ActiveRequestDisplay } from '../../services/ui/types'

const WEI_PER_ETHER = 10n ** 18n

/**
 * Reads the user's active deposit and redeem requests from the BTC vault contract
 * via two-phase multicall, derives pending/claimable status, and maps to display shape.
 *
 * Phase 1: depositReq(address), redeemReq(address). If both zero, returns [].
 * Phase 2 (when at least one request): pending/claimable and epochSnapshot per request.
 *
 * @param address - User wallet address (controller); undefined disables reads
 * @returns { data } - ActiveRequestDisplay[] for dashboard, or undefined while loading/error
 */
export function useActiveRequests(address: string | undefined): { data: ActiveRequestDisplay[] | undefined } {
  const { prices } = usePricesContext()
  const rbtcPrice = prices[RBTC]?.price ?? 0

  const phase1Contracts = useMemo(
    () =>
      [
        { ...rbtcVault, functionName: 'depositReq' as const, args: [(address ?? zeroAddress) as Address] },
        { ...rbtcVault, functionName: 'redeemReq' as const, args: [(address ?? zeroAddress) as Address] },
      ] as const,
    [address],
  )

  const {
    data: phase1Data,
    isLoading: isLoading1,
    error: error1,
  } = useReadContracts({
    contracts: phase1Contracts,
    query: { enabled: !!address },
  })

  const phase2Contracts = useMemo(() => {
    if (!address || !phase1Data || phase1Data.length < 2) return []
    const depositResult =
      phase1Data[0]?.status === 'success' ? (phase1Data[0].result as readonly [bigint, bigint]) : undefined
    const redeemResult =
      phase1Data[1]?.status === 'success' ? (phase1Data[1].result as readonly [bigint, bigint]) : undefined
    const depEpochId = depositResult?.[0] ?? 0n
    const depAssets = depositResult?.[1] ?? 0n
    const redEpochId = redeemResult?.[0] ?? 0n
    const redShares = redeemResult?.[1] ?? 0n
    if (depAssets === 0n && redShares === 0n) return []
    const list: Array<
      typeof rbtcVault & { functionName: string; args: readonly [bigint, Address] | readonly [bigint] }
    > = []
    if (depAssets > 0n) {
      list.push(
        {
          ...rbtcVault,
          functionName: 'pendingDepositRequest' as const,
          args: [depEpochId, address as Address],
        },
        {
          ...rbtcVault,
          functionName: 'claimableDepositRequest' as const,
          args: [depEpochId, address as Address],
        },
        { ...rbtcVault, functionName: 'epochSnapshot' as const, args: [depEpochId] },
      )
    }
    if (redShares > 0n) {
      list.push(
        {
          ...rbtcVault,
          functionName: 'pendingRedeemRequest' as const,
          args: [redEpochId, address as Address],
        },
        {
          ...rbtcVault,
          functionName: 'claimableRedeemRequest' as const,
          args: [redEpochId, address as Address],
        },
        { ...rbtcVault, functionName: 'epochSnapshot' as const, args: [redEpochId] },
      )
    }
    return list
  }, [address, phase1Data])

  const needsPhase2 = phase2Contracts.length > 0

  const {
    data: phase2Raw,
    isLoading: isLoading2,
    error: error2,
  } = useReadContracts({
    contracts: phase2Contracts,
    query: { enabled: !!address && needsPhase2 },
  })

  // SAFETY: narrow type to avoid wagmi's "excessively deep" instantiation in useMemo deps
  const phase2Data = phase2Raw as readonly { status: string; result?: unknown }[] | undefined

  const data = useMemo((): ActiveRequestDisplay[] | undefined => {
    if (!address) return undefined
    if (isLoading1 || error1) return undefined
    if (!phase1Data || phase1Data.length < 2) return undefined

    const depositResult =
      phase1Data[0]?.status === 'success' ? (phase1Data[0].result as readonly [bigint, bigint]) : undefined
    const redeemResult =
      phase1Data[1]?.status === 'success' ? (phase1Data[1].result as readonly [bigint, bigint]) : undefined
    const depEpochId = depositResult?.[0] ?? 0n
    const depAssets = depositResult?.[1] ?? 0n
    const redEpochId = redeemResult?.[0] ?? 0n
    const redShares = redeemResult?.[1] ?? 0n

    if (depAssets === 0n && redShares === 0n) return []

    if (!needsPhase2) return []
    if (isLoading2 || error2 || !phase2Data) return undefined

    const requests: Array<{ req: VaultRequest; claimableInfo: ClaimableInfo | null }> = []
    const hasDeposit = depAssets > 0n
    const hasRedeem = redShares > 0n

    if (hasDeposit) {
      // const pendingIdx = 0
      const claimableIdx = 1
      const snapshotIdx = 2
      // const pendingAssets = (phase2Data[pendingIdx]?.status === 'success' ? phase2Data[pendingIdx].result : 0n) as bigint
      const claimableAssets = (
        phase2Data[claimableIdx]?.status === 'success' ? phase2Data[claimableIdx].result : 0n
      ) as bigint
      const status = claimableAssets > 0n ? ('claimable' as const) : ('pending' as const)
      let claimableInfo: ClaimableInfo | null = null
      if (status === 'claimable' && phase2Data[snapshotIdx]?.status === 'success') {
        const snap = phase2Data[snapshotIdx].result as readonly [bigint, bigint, bigint, bigint]
        const assetsAtClose = snap[1]
        const supplyAtClose = snap[2]
        const navPerShare =
          supplyAtClose + 1n > 0n ? ((assetsAtClose + 1n) * WEI_PER_ETHER) / (supplyAtClose + 1n) : 0n
        claimableInfo = { claimable: true, lockedSharePrice: navPerShare }
      }
      requests.push({
        req: {
          id: `dep-${depEpochId}`,
          type: 'deposit',
          amount: depAssets,
          status,
          epochId: String(depEpochId),
          batchRedeemId: null,
          timestamps: { created: 0 },
          txHashes: {},
        },
        claimableInfo,
      })
    }

    if (hasRedeem) {
      const base = hasDeposit ? 3 : 0
      // const pendingIdx = base + 0
      const claimableIdx = base + 1
      const snapshotIdx = base + 2
      // const pendingShares = (phase2Data[pendingIdx]?.status === 'success' ? phase2Data[pendingIdx].result : 0n) as bigint
      const claimableShares = (
        phase2Data[claimableIdx]?.status === 'success' ? phase2Data[claimableIdx].result : 0n
      ) as bigint
      const status = claimableShares > 0n ? ('claimable' as const) : ('pending' as const)
      let claimableInfo: ClaimableInfo | null = null
      if (status === 'claimable' && phase2Data[snapshotIdx]?.status === 'success') {
        const snap = phase2Data[snapshotIdx].result as readonly [bigint, bigint, bigint, bigint]
        const assetsAtClose = snap[1]
        const supplyAtClose = snap[2]
        const navPerShare =
          supplyAtClose + 1n > 0n ? ((assetsAtClose + 1n) * WEI_PER_ETHER) / (supplyAtClose + 1n) : 0n
        claimableInfo = { claimable: true, lockedSharePrice: navPerShare }
      }
      requests.push({
        req: {
          id: `red-${redEpochId}`,
          type: 'withdrawal',
          amount: redShares,
          status,
          epochId: null,
          batchRedeemId: String(redEpochId),
          timestamps: { created: 0 },
          txHashes: {},
        },
        claimableInfo,
      })
    }

    return requests.map(({ req, claimableInfo }) => toActiveRequestDisplay(req, claimableInfo, rbtcPrice))
  }, [address, phase1Data, phase2Data, needsPhase2, isLoading1, isLoading2, error1, error2, rbtcPrice])

  return { data }
}
