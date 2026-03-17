'use client'

import { useCallback, useMemo } from 'react'
import type { Address } from 'viem'
import { useReadContract, useReadContracts } from 'wagmi'

import { getAbi } from '@/lib/abis/btc-vault'
import { WHITELISTED_USER_ROLE } from '@/lib/constants'
import { rbtcVault } from '@/lib/contracts'

import type { EligibilityStatus, PauseState, VaultRequest } from '../../services/types'
import { toActionEligibility } from '../../services/ui/mappers'

const permissionsManagerAbi = getAbi('PermissionsManagerAbi')

/**
 * Reads vault pause state, user eligibility (whitelist), and active deposit/redeem
 * requests via multicall, then maps to action eligibility for deposit/withdraw buttons.
 *
 * Two RPC calls total:
 * 1. Multicall on vault: pause flags, deposit/redeem requests, permissionsManager address
 * 2. hasRole on PermissionsManager (depends on address from step 1)
 *
 * WHITELISTED_USER_ROLE is `internal` in Roles.sol so there is no on-chain getter;
 * the frontend mirrors the same keccak256("WHITELISTED_USER_ROLE") computation.
 */
export function useActionEligibility(address: string | undefined) {
  const enabled = !!address

  const vaultContracts = useMemo(() => {
    if (!address) return
    return [
      { ...rbtcVault, functionName: 'depositRequestsPaused' as const },
      { ...rbtcVault, functionName: 'redeemRequestsPaused' as const },
      { ...rbtcVault, functionName: 'depositReq' as const, args: [address as Address] },
      { ...rbtcVault, functionName: 'redeemReq' as const, args: [address as Address] },
      { ...rbtcVault, functionName: 'permissionsManager' as const },
    ] as const
  }, [address])

  const {
    data: vaultData,
    isLoading: isLoadingVault,
    error: vaultError,
    refetch: refetchVault,
  } = useReadContracts({
    contracts: vaultContracts,
    query: { enabled },
  }) as {
    data:
      | [
          { status: string; result?: boolean },
          { status: string; result?: boolean },
          { status: string; result?: readonly [bigint, bigint] },
          { status: string; result?: readonly [bigint, bigint] },
          { status: string; result?: Address },
        ]
      | undefined
    isLoading: boolean
    error: Error | null
    refetch: () => void
  }

  const pmAddress = vaultData?.[4]?.status === 'success' ? vaultData[4].result : undefined

  const {
    data: hasRoleResult,
    isLoading: isLoadingHasRole,
    error: errorHasRole,
    refetch: refetchHasRole,
  } = useReadContract({
    address: pmAddress,
    abi: permissionsManagerAbi,
    functionName: 'hasRole',
    args: pmAddress && address ? [WHITELISTED_USER_ROLE, address as Address] : undefined,
    query: { enabled: !!pmAddress && !!address },
  })

  const refetch = useCallback(() => {
    refetchVault()
    refetchHasRole()
  }, [refetchVault, refetchHasRole])

  const data = useMemo(() => {
    if (!address || !vaultData) return
    if (!pmAddress || hasRoleResult === undefined) return

    const depositPaused = vaultData[0]?.status === 'success' ? vaultData[0].result : true
    const redeemPaused = vaultData[1]?.status === 'success' ? vaultData[1].result : true
    const depositReq = vaultData[2]?.status === 'success' ? vaultData[2].result : undefined
    const redeemReq = vaultData[3]?.status === 'success' ? vaultData[3].result : undefined

    const pause: PauseState = {
      deposits: depositPaused ? 'paused' : 'active',
      withdrawals: redeemPaused ? 'paused' : 'active',
    }

    const hasWhitelistedRole = hasRoleResult === true
    const eligibility: EligibilityStatus = {
      eligible: hasWhitelistedRole,
      reason: hasWhitelistedRole ? '' : 'Address not whitelisted',
    }

    const activeRequests: VaultRequest[] = []
    if (depositReq && depositReq[1] > 0n) {
      activeRequests.push({
        id: 'active-deposit',
        type: 'deposit',
        amount: depositReq[1],
        status: 'pending',
        epochId: String(depositReq[0]),
        batchRedeemId: null,
        timestamps: { created: 0 },
        txHashes: {},
      })
    }
    if (redeemReq && redeemReq[1] > 0n) {
      activeRequests.push({
        id: 'active-redeem',
        type: 'withdrawal',
        amount: redeemReq[1],
        status: 'pending',
        epochId: null,
        batchRedeemId: String(redeemReq[0]),
        timestamps: { created: 0 },
        txHashes: {},
      })
    }

    return toActionEligibility(pause, eligibility, activeRequests)
  }, [address, vaultData, pmAddress, hasRoleResult])

  const isLoading = (enabled && isLoadingVault) || (!!pmAddress && isLoadingHasRole)
  const error = vaultError ?? errorHasRole

  return {
    data,
    isLoading,
    error: error ?? undefined,
    refetch,
  }
}
